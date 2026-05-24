# PROMPT_RECORD_V1 — Enregistrer une séance

## Contexte

La page "Enregistrer une séance" existe déjà et affiche "Bientôt disponible". Elle correspond au bouton central de la navigation mobile. Ce prompt remplace son contenu par une interface d'enregistrement GPS complète.

## Schéma Supabase créé

```sql
CREATE TABLE workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  sport text not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds integer,
  distance_m numeric(10,2) default 0,
  elevation_gain_m numeric(8,2) default 0,
  avg_speed_kmh numeric(6,2),
  max_speed_kmh numeric(6,2),
  avg_hr integer,
  calories integer,
  gps_track jsonb default '[]',
  laps jsonb default '[]',
  strava_activity_id text,
  status text default 'recording',
  created_at timestamptz default now()
);

CREATE TABLE sport_page_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  sport text not null,
  pages jsonb not null default '[]',
  created_at timestamptz default now(),
  UNIQUE(user_id, sport)
);
```

RLS activé sur les deux tables. Policy : `auth.uid() = user_id`.

## Architecture des fichiers

```
hooks/
  useGPSTracking.ts       — watchPosition, Haversine, D+, vitesse
  useStopwatch.ts         — chrono, format HH:MM:SS

components/record/
  MapDisplay.tsx          — Leaflet map (client-only, dynamic import)
  SportSelector.tsx       — bottom sheet 6 sports
  CyclingDataPage.tsx     — 1 page de données (main / carte / laps)
  CyclingControls.tsx     — boutons prêt / en cours / en pause
  LapsList.tsx            — tableau des laps
  CyclingScreen.tsx       — écran vélo complet (swipe pages, state machine)

app/(app)/record/
  page.tsx                — Écran 1 : carte + boutons + SportSelector
  cycling/
    page.tsx              — Écran 3 : CyclingScreen en overlay fixed
```

## Écran 1 — Page d'accueil enregistrement

- Carte Leaflet plein haut (60% hauteur) : tuiles CartoDB Light, marqueur cyan pulsant
- Panel bas (40%) : boutons "Démarrer une activité" et "Créer un parcours"
- "Démarrer" → ouvre SportSelector
- "Créer un parcours" → toast "Fonctionnalité à venir"

## Écran 2 — Sélection du sport

Bottom sheet animé (translateY). 6 sports en grille 3 colonnes :
- Vélo → `/record/cycling`
- Autres → toast "Bientôt disponible"

## Écran 3 — Compteur vélo

Fond #0A0A0A. Plein écran (fixed inset-0 z-[100]).
3 pages swipeables haut/bas :
1. Vitesse grande + Distance + Durée + D+ + Allure
2. Mini-carte Leaflet avec tracé GPS
3. Lap actuel + tableau des laps passés

State machine : `ready → running ↔ paused → [save]`

Contrôles bas :
- Prêt : DÉMARRER (cyan→bleu)
- En cours : LAP (gauche) + PAUSE (centre)
- En pause : TERMINER (rouge, gauche) + REPRENDRE (cyan→bleu, centre)

Sauvegarde dans `workout_sessions` à la fin, puis retour à `/record`.

## Dépendances installées

```
leaflet ^1.9.4
react-leaflet ^5.0.0
@types/leaflet
```
