# PROMPT_IA_SIDEBAR_V2 — Sidebar IA THW Coaching

## Contexte

Interface IA de THW Coaching : chat multi-agents (Training, Networks) avec historique de conversations et projets.
Inspirée de l'interface Claude (claude.ai) : sidebar sombre, nav par agent, liste des conversations récentes, bouton "Nouvelle conversation".

## Analyse du codebase existant

### Résultats de l'audit
- **Logo/Shuriken** : aucun composant existant dans le projet (public/ vide, aucun .svg/.png, aucun composant Logo)
  → À créer : `components/ui/LogoShuriken.tsx` (SVG shuriken THW)
- **Interface IA** : aucun dossier `app/(app)/ai/` ni `components/ai/`
  → Création complète from scratch
- **Table `ai_conversations`** : à vérifier / créer avec colonnes `is_project`, `project_name`, `agent`
- **Route group** : l'interface IA a son propre layout (pas de sidebar principale)
  → Route group `app/(ai)/ai/` avec layout indépendant

### Architecture cible

```
app/
  (ai)/
    ai/
      layout.tsx        ← layout plein écran, auth, sans sidebar principale
      page.tsx          ← shell : AISidebar + ChatArea
components/
  ui/
    LogoShuriken.tsx    ← SVG shuriken officiel THW, prop size + color
  ai/
    AISidebar.tsx       ← sidebar sombre #1A1A1A (< 200 lignes)
    NavItem.tsx         ← bouton de navigation agent
    ConversationList.tsx ← liste conversations filtrée par agent
    AIHeader.tsx        ← header mobile (hamburger + nom agent + actions)
    EmptyState.tsx      ← écran vide avec logo centré
    ChatArea.tsx        ← zone de chat (placeholder pour les messages)
```

## Problèmes identifiés et corrections

### P1 — Logo manquant
Aucun composant Logo existant → créer `LogoShuriken` avec SVG shuriken THW.
Props : `size` (number, défaut 24), `color` (string, défaut 'currentColor').

### P2 — Sidebar IA à construire
Structure exacte (voir sections ci-dessous).

### P3 — Table `ai_conversations` manquante
Migration SQL requise :
```sql
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent text NOT NULL DEFAULT 'training',
  title text,
  is_project boolean DEFAULT false,
  project_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own conversations"
  ON ai_conversations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
ALTER TABLE ai_conversations
  ADD COLUMN IF NOT EXISTS is_project boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS project_name text;
```

### P4 — Animations sidebar mobile
CSS keyframes dans `globals.css` pour slide-in/out + backdrop blur.

## Spécifications UI

### Couleurs
- Fond sidebar : `#1A1A1A`
- Texte actif : `white`
- Texte secondaire : `white/70` (inactif) / `white/40` (labels, dates)
- Item actif : `white/10`
- Hover : `white/5`
- Bouton "Nouvelle conversation" : `white`, texte `#1A1A1A`

### Agents
| Agent | Couleur | Label UI |
|---|---|---|
| training | `#2563EB` (bleu) | Training |
| networks | `#7C3AED` (violet) | Networks |

### Structure sidebar (desktop : fixe 260px, mobile : overlay)

1. **Zone haute** : titre "Hybrid" (28px semibold) + avatar initiale utilisateur
2. **Navigation** : 3 items (Projets / Training / Networks)
3. **Séparateur** + label "Récents"
4. **Liste conversations** : filtrée par agent actif, title + date relative
5. **Bouton Nouvelle conversation** : pill blanche, icône +, en bas

### Header mobile
Hamburger gauche + nom agent centré (LogoShuriken + label) + actions droite (+ / expand / close)

### Écran vide
LogoShuriken 52px centré + titre greeting + sous-titre "Comment puis-je t'aider ?"

## Contraintes techniques

1. Chaque fichier < 200 lignes
2. `npx tsc --noEmit` sans erreur avant commit
3. Ne pas modifier la logique agents (system prompts, API calls)
4. Le logo THW = `LogoShuriken` — jamais de SVG étoile inline ad-hoc
5. `npm run build` doit passer

## Fichiers à créer / modifier

| Fichier | Action |
|---|---|
| `PROMPT_IA_SIDEBAR_V2.md` | ✅ Ce fichier |
| `components/ui/LogoShuriken.tsx` | CRÉER |
| `app/(ai)/ai/layout.tsx` | CRÉER |
| `app/(ai)/ai/page.tsx` | CRÉER |
| `components/ai/AISidebar.tsx` | CRÉER |
| `components/ai/NavItem.tsx` | CRÉER |
| `components/ai/ConversationList.tsx` | CRÉER |
| `components/ai/AIHeader.tsx` | CRÉER |
| `components/ai/EmptyState.tsx` | CRÉER |
| `components/ai/ChatArea.tsx` | CRÉER |
| `app/globals.css` | MODIFIER (animations sidebar) |
| `components/sidebar/Sidebar.tsx` | MODIFIER (lien /ai) |
| Migration `ai_conversations` | APPLIQUER |
