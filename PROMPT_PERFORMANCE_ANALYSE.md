# Analyse — Page Performance
> Document d'analyse et de validation. Aucun fichier de code ne sera modifié avant validation explicite.

---

## État des lieux

La page Performance **n'existe pas encore** dans `thw-v2`. Le repo est une base fraîche : seules la page Training (créée ce jour), le Dashboard, et les Candidatures existent.

Les tables Supabase pertinentes pour cette page existent déjà et contiennent des données réelles :

| Table | Usage pour Performance |
|---|---|
| `athlete_performance_profile` | Profil Global (FTP, LTHR, VMA, CSS, poids, taille, FC max/repos) |
| `training_zones` | Zones par sport (bike, run) avec FTP, LTHR, paliers SL1/SL2 |
| `athlete_zones` | FTP, FTHR, VMA, CSS, zones HR/power/pace par sport |
| `personal_records` | Records Cyclisme (Pmax, 10s, 30s, 1min…5h en watts), Run, Natation, Aviron |
| `race_results` | Résultats compétitions (Triathlon, Hyrox, Run, Natation) avec splits |
| `activities` | Activités avec streams, TSS, avg_watts, avg_hr |
| `performance_records` | Bests par durée et type |

---

## Étape 1 — Reformulation des demandes

### 1. PROFIL ATHLÈTE

**Demande :** Créer deux types de profil — Global et Spécifique — dans la bulle Profil Athlète.

**Ce que j'ai compris :**

**Profil Global** (déjà en place en DB) : paramètres physiologiques généraux
- Poids, taille, âge, FC max, FC repos, VO2max — tirés de `athlete_performance_profile`
- Ces données existent déjà dans la DB, il faut les afficher proprement dans une UI

**Profil Spécifique** (nouveau — à créer) : paramètres par sport, permettant à l'athlète de saisir et consulter ses valeurs cibles/mesurées. Il faut un formulaire de saisie + affichage par sport :

- **Running** :
  - FC EF (fréquence cardiaque en endurance fondamentale)
  - FC SL1 (FC au premier seuil)
  - FC SL2 (FC au deuxième seuil)
  - Allure EF fourchette basse / haute (ex. 5:00–5:30/km)
  - Allure SL1, Allure SL2
  - Allure VMA

- **Cyclisme** :
  - FC EF, FC SL1, FC SL2
  - Watts EF (fourchette basse/haute)
  - Watts SL1, Watts SL2, Watts PMA
  - Max power (puissance max absolue)
  - FTP (Functional Threshold Power)

- **Natation** :
  - CSS (Critical Swim Speed — allure critique sur 100m)
  - Temps 400m de référence

- **Hyrox** (paramètres par catégorie — Open F / Open H & Pro F / Pro H) :
  - Max reps wall ball (poids de la course)
  - Allure run compromised (allure visée en course)
  - Max distance farmer carry (Open F : 16kg / Open H & Pro F : 24kg / Pro H : 32kg)
  - Temps 100m BBJ
  - Temps 200m lunges (Open F : 10kg / Open H & Pro F : 20kg / Pro H : 30kg)
  - Temps 100m sled push (Open F : 102kg / Open H & Pro F : 152kg / Pro H : 202kg)
  - Temps 100m sled pull (Open F : 78kg / Open H & Pro F : 103kg / Pro H : 153kg)
  - Temps 2000m skierg
  - Temps 2000m row

**Note importante :** Pour Hyrox, les poids varient selon la catégorie (Open F / Open H & Pro F / Pro H). L'UI doit permettre de sélectionner sa catégorie pour que les poids s'affichent correctement.

**Stockage :** Ces données spécifiques devront probablement s'appuyer sur `training_zones` (pour les zones FC/watts) et éventuellement une extension de `athlete_performance_profile` ou une nouvelle colonne JSONB pour les paramètres Hyrox.

---

### 2. DATAS — Bulle Records

#### 2a. Suivi du curseur sur les graphiques
**Demande :** La ligne du graphique doit suivre la souris (curseur vertical/horizontal qui se déplace avec la souris sur le graphique).

**Ce que j'ai compris :** Quand l'utilisateur passe la souris sur un graphique, une ligne verticale (ou crosshair) doit suivre la position du curseur et afficher les valeurs correspondantes. C'est un comportement standard de type "hover line" qui remplace ou complète le simple tooltip sur point fixe. À implémenter en SVG avec un gestionnaire `onMouseMove`.

#### 2b. Nouveau graphique Cyclisme : Best Performance Climb
**Demande :** Ajouter un graphique "Meilleures performances en côte/col".

**Ce que j'ai compris :** Un nouveau graphique dans la bulle Records Cyclisme qui affiche les meilleures performances sur des montées spécifiques (côtes, cols). Les données seraient des segments d'activité (via Strava segments ou données manuelles). Il faut déterminer si ces données existent dans la DB ou si c'est à saisir manuellement. En l'état, `personal_records` peut accueillir ce type de données avec un `event_type` = 'climb'.

#### 2c. Records Run / Natation / Aviron par année
**Demande :** Afficher les records par année (meilleur temps de chaque année par distance), pour Run, Natation et Aviron.

**Ce que j'ai compris :** Actuellement `personal_records` a un champ `year`. Il faut restructurer l'affichage en vue tableau/grille :
- Lignes = distances (5km, 10km, Semi, Marathon pour le run)
- Colonnes = années (2022, 2023, 2024, 2025, 2026)
- Cellule = meilleur temps de l'année, avec mise en évidence du record absolu
- Même logique pour Natation (distances bassin : 50m, 100m, 200m, etc.) et Aviron (500m, 1000m, 2000m, etc.)

#### 2d. Triathlon — Comparaison multi-dimensionnelle
**Demande :** Comparaison par distance et par année, avec analyse approfondie.

**Ce que j'ai compris :** C'est la fonctionnalité la plus complexe des Records :
1. **Comparaison sur une même année** : pour la même distance (ex. Ironman 70.3), montrer tous les résultats de l'année en cours côte à côte
2. **Comparaison inter-années** : meilleur temps par année par distance (ex. meilleur IM 70.3 2024 vs 2025)
3. **Vue détaillée par discipline** : pour chaque course, afficher les splits natation/T1/vélo/T2/run séparément, pas uniquement le chrono final
4. **Performance ajustée** : calculer un score de performance qui prend en compte le parcours (dénivelé, profil) et la température, pour pouvoir comparer des courses qui ne sont pas identiques. C'est un index de difficulté qui normalise le chrono.
5. **Watts et allure** : comparer les watts moyens/pondérés vélo et l'allure run entre les courses

Les données `race_results` ont déjà `split_swim`, `split_bike`, `split_run`, `split_t1`, `split_t2`. Il manque peut-être les données de parcours et de température (à ajouter).

#### 2e. Hyrox — Analyse détaillée des courses
**Demande :** Vue complète des performances Hyrox.

**Ce que j'ai compris :**
1. **Vue principale** : toutes les courses triées dans l'ordre chronologique, avec le temps total, par catégorie (Open F/H, Pro F/H)
2. **Meilleur temps par année** : par catégorie
3. **Détail par station** : pour chaque course, voir les 8 stations (ski erg, sled push, sled pull, burpee broad jumps, rowing, farmer carry, sandbag lunges, wall balls) + le run compromised total
4. **Run compromised** : détail de chacun des 8 runs de 1km intercalés entre les stations

Les données `race_results` ont `station_times` (JSONB) qui peut contenir ces détails.

---

### 3. DATAS — Year Datas

**Demande :** Trois modifications sur la section "Données annuelles".

**Ce que j'ai compris :**

1. **Refonte esthétique du graphique volume par sport** : Le graphique actuel est visuellement insuffisant. Il faut un design plus propre, plus lisible, avec les couleurs sport cohérentes (déjà définies dans `lib/constants/sports.ts`).

2. **Réduction des boutons** : Trop de contrôles/filtres qui surchargent l'interface. Il faut identifier lesquels sont redondants ou peu utilisés et les fusionner, masquer ou supprimer.

3. **Format horaire HhMM** : Les heures doivent s'afficher en `4h53` et non `4h9`. Autrement dit, les minutes doivent toujours être sur 2 chiffres avec zéro de remplissage (c'est déjà implémenté dans `TrainingStats.tsx` de la page Training avec `padStart(2, '0')` — il faudra appliquer le même formatage dans la page Performance).

---

### 4. TESTS

#### 4a. UX générale des cartes de test
**Demande :** Simplifier et améliorer l'interaction avec les cartes de test.

**Ce que j'ai compris :**
- **Supprimer** les boutons "Analyser" et "Ouvrir" de chaque carte
- **Rendre toute la carte cliquable** pour ouvrir le test (pas uniquement un bouton)
- **Ajouter** la possibilité d'uploader des fichiers/documents (PDF, images, CSV, etc.) pour chaque test
- **Bouton "Enregistrer"** qui apparaît dès qu'une donnée est saisie ou un fichier ajouté
- **Historique** : quand un test est enregistré, l'historique de tous les enregistrements précédents s'affiche dans le test (timeline)
- **Bulle "Historique Tests"** : une section dédiée regroupant tous les tests de tous types avec leur historique

#### 4b. Bulle Cyclisme — Tests Endurance
**Demande :** Remplacer/étendre le test d'endurance existant par 3 variantes.

**Ce que j'ai compris :** L'ancien test (2h) devient l'un des trois proposés :

- **Test 1 — Endurance Long** : même protocole que l'existant mais sur **4h** (au lieu de 2h). Mesure FC toutes les 30min, dérive cardiaque sur la durée.
- **Test 2 — Endurance Progressive** : 2h en EF basse + 2h en EF moyenne + 1h en EF haute. Même principe de mesures régulières. Objectif : évaluer la capacité à soutenir des intensités croissantes sur une longue durée.
- **Test 3 — Endurance + Seuil** : 3h30 à 5h30 de full endurance (selon le niveau), suivi de 20 minutes à FTP, puis 10 minutes de récupération. Objectif : évaluer l'état de forme aérobie profonde et la capacité à encore produire au seuil après un long effort.

#### 4c. Bulle Natation — Test Hypoxie (NOUVEAU)
**Demande :** Créer un nouveau test natation.

**Ce que j'ai compris :** Un test simple : nager le plus loin possible en crawl sans respirer (apnée dynamique). On enregistre la distance parcourue. Ce n'est pas un test d'endurance traditionnel mais un test de capacité hypoxique et d'efficacité de nage.

#### 4d. Bulle Hyrox — Tests (refonte)
**Demande :** Corriger l'ordre du PFT et ajouter/modifier des tests.

**Ce que j'ai compris :**

- **Test PFT** : les exercices doivent être réordonnés (ordre correct de la compétition Hyrox)

- **BBJ (Burpee Broad Jumps)** : deux tests distincts :
  1. Meilleur temps sur **200m** (distance standard)
  2. Meilleur temps sur **400m** (test d'endurance extrême — hors standard de course)

- **Farmer Carry** : distance maximale parcourue sans poser les kettlebells, **au poids de la course** (selon catégorie)

- **Wall Ball** : deux tests distincts :
  1. **Max reps** : maximum de répétitions en continu, au poids de la course
  2. **Test d'endurance** : 10 wall balls + 10 secondes de pause (balle maintenue au-dessus de la tête) → répéter jusqu'à épuisement. Comptabiliser toutes les reps, y compris celles d'une série incomplète.

- **Run Compromised** : protocole spécifique :
  - 40 squats + 40 fentes (à bon rythme, pas à fond)
  - Immédiatement suivi d'un 1000m run à fond
  - 4 minutes de récupération
  - Répéter × 5
  - Objectif : maximiser la moyenne des 5 chronos de 1000m

---

## Étape 2 — Analyse critique

### 2.1 Ce qui n'existe pas encore et sera à créer from scratch

La page Performance est entièrement absente de `thw-v2`. Cela signifie :
- Pas de route `/performance`
- Pas de composants `PerformanceProfil`, `RecordsChart`, `YearDatas`, `TestBulle`
- Pas de lien dans la Sidebar vers cette page

C'est **une création complète**, pas une modification. Il faudra décider d'une architecture de composants dès le départ pour éviter de refactoriser deux fois.

---

### 2.2 Problèmes dans les données Supabase

**`training_zones` : trop de lignes actives (`is_current = true`)**
En DB, il y a **plusieurs lignes** avec `is_current = true` pour le même sport `bike`. C'est une incohérence : un seul jeu de zones devrait être "current" à la fois. Sans contrainte UNIQUE ou trigger de désactivation, la requête `.eq('is_current', true)` retourne plusieurs lignes et peut provoquer des comportements imprévisibles.

**`performance_records` : données très pauvres**
La table `performance_records` n'a que 2 entrées. Les vraies données de courbe de puissance sont dans `personal_records`. Il y a donc **deux tables qui font conceptuellement la même chose** pour les records cyclisme, ce qui crée une ambiguïté.

**`personal_records` pour Hyrox : station_times absent**
Les résultats de courses Hyrox sont dans `race_results` avec un champ `station_times` (JSONB). Mais sans schéma strict de ce JSONB, chaque entrée peut avoir une structure différente (noms de clés inconsistants, unités différentes), rendant l'affichage unifié des 8 stations difficile.

**`athlete_performance_profile` : champ `history` non structuré**
Le champ `history` est un JSONB sans contrainte. L'historique des changements de FTP, LTHR, etc. peut y être stocké de façon hétérogène selon qui l'a saisi.

---

### 2.3 Incohérences dans le code Training créé

**Duplication des constantes sport**
Dans `ProgressionBubble.tsx`, les constantes `SPORT_LABELS` et `SPORT_COLORS` sont **redéfinies localement** au lieu d'importer depuis `lib/constants/sports.ts`. Si les couleurs changent un jour, il faudra modifier deux endroits. **À corriger en priorité**.

**Zone FC basée sur FCmax estimée, pas sur LTHR**
Dans `HRZoneChart.tsx`, les zones sont calculées comme % de FCmax. Or le standard en endurance (notamment Friel) utilise la LTHR (Lactate Threshold Heart Rate). L'athlète a une LTHR définie dans `training_zones` mais elle n'est pas utilisée. Les zones actuelles sont donc une approximation qui peut être significativement fausse.

**PowerCurveChart : données hardcodées pour la période > 2026**
Les couleurs années dans `YEAR_COLORS` sont hardcodées pour 2021–2026. En 2027 ou au-delà, les courbes n'auront plus de couleur définie et tomberont sur `'#6B7280'` (gris). Il faut une génération dynamique de couleurs.

**`minWatts * 0.92` dans ProgressionBubble**
Si `sorted` est vide, `Math.min(...[])` retourne `Infinity`, et `Infinity * 0.92 = Infinity`. Le graphique plantera silencieusement sur des données vides (cas edge). Il y a une garde `Math.min(...sorted.map(...), 0)` mais la multiplication par 0.92 se fait après.

---

### 2.4 Opportunités UX non listées dans le PDF

**Profil : historique des changements de paramètres**
Pour le Profil Spécifique, afficher l'évolution des paramètres dans le temps (ex. FTP de 240W en jan. 2024 → 260W en mars 2024 → 285W en oct. 2024) serait très utile et valorisant pour l'athlète. La DB a déjà une colonne `history` dans `athlete_performance_profile`.

**Records : meilleure mise en évidence des progressions**
Dans la vue Records Run par année, un code couleur montrant si le temps de l'année est meilleur/identique/moins bon que l'année précédente rendrait la lecture instantanée.

**Hyrox Records : comparaison de catégorie**
Un athlète qui passe de "Open H" à "Pro H" ne peut pas comparer ses temps directement (poids différents). L'UI devrait signaler les changements de catégorie dans l'historique pour éviter les confusions.

**Tests : pas de notification quand un test "expire"**
Certains tests (FTP, VMA) devraient être refaits régulièrement (tous les 6–12 semaines). L'app pourrait afficher une alerte si le dernier test date de trop longtemps.

**Year Datas : absence de tendance sur plusieurs années**
Le graphique volume par sport montre l'année en cours mais ne permet pas de voir si l'athlète s'entraîne plus ou moins que l'année dernière à la même période. Un graphique de comparaison year-over-year serait très pertinent.

**Tests Hyrox : le poids de l'athlète n'est pas lié à la catégorie**
Dans les tests Hyrox, le "poids de la course" (ex. wall ball 9kg pour Open H) dépend de la catégorie choisie. Si l'athlète change de catégorie, les tests passés ne seront plus comparables. Il faut sauvegarder la catégorie avec chaque résultat de test.

---

### 2.5 Architecture recommandée pour la page Performance

Compte tenu de la complexité, je recommande de structurer la page Performance en sections indépendantes avec des composants distincts :

```
app/(app)/performance/
  page.tsx                     → Server Component (fetch data)
  
components/performance/
  PerformanceProfil.tsx         → Profil Global + Spécifique (tabs)
  ProfileGlobal.tsx             → Paramètres physiologiques globaux
  ProfileSpecific.tsx           → Paramètres par sport (form + display)
  HyroxCategorySelector.tsx     → Sélecteur catégorie Hyrox avec poids
  RecordsBubble.tsx             → Container des records (tabs par sport)
  RecordsCyclisme.tsx           → Courbe puissance + Best Climb
  RecordsRun.tsx                → Tableau records par année/distance
  RecordsNatation.tsx           → Même structure que Run
  RecordsAviron.tsx             → Même structure que Run
  RecordsTriathlon.tsx          → Vue splits + ajustement parcours/temp
  RecordsHyrox.tsx              → Tableau courses + détail stations
  RecordsCursorChart.tsx        → Composant SVG avec curseur suiveur
  YearDatas.tsx                 → Graphique volume annuel refait
  TestBubble.tsx                → Container tests (Historique + sports)
  TestCard.tsx                  → Carte test générique (cliquable, upload)
  TestHistory.tsx               → Historique d'un test
  AllTestsHistory.tsx           → "Historique Tests" — tous les tests
  CyclismeTests.tsx             → 3 tests endurance
  NatationTests.tsx             → Test hypoxie + autres
  HyroxTests.tsx                → PFT + BBJ + Farmer + Wall Ball + Run Compromised
```

---

## Étape 3 — En attente de validation

**Je n'ai touché à aucun fichier de code.**

Avant de commencer l'implémentation, j'ai besoin de ta confirmation sur :

1. **Architecture** : la structure de composants proposée ci-dessus te convient-elle ?
2. **Profil Spécifique / Stockage** : les paramètres sport-spécifiques doivent-ils s'appuyer sur les tables existantes (`training_zones`, `athlete_performance_profile`) ou créer une nouvelle table ?
3. **Best Performance Climb** : les données de côtes/cols sont-elles déjà dans la DB (segments Strava ?) ou à saisir manuellement ?
4. **Triathlon — score ajusté parcours/température** : as-tu un algorithme précis en tête ou je propose une formule ?
5. **Priorité** : dans quel ordre dois-je implémenter les sections (Profil, Records, Year Datas, Tests) ?
