'use client'

import type { TestEntry } from './TestsSection'
import { TestCard } from './TestCard'

interface Props {
  userId: string
  tests: TestEntry[]
  onAdd: (t: TestEntry) => void
}

export function HyroxTests({ userId, tests, onAdd }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 mb-4">
        Tests spécifiques Hyrox — évaluation de la performance sur chaque discipline.
      </p>

      {/* PFT — Physical Fitness Test */}
      <TestCard
        title="PFT — Physical Fitness Test"
        description="Test de condition physique générale : Pull-ups, Push-ups, Sit-ups, Run 1.5mi"
        testType="pft"
        sport="hyrox"
        userId={userId}
        pastTests={tests}
        onAdd={onAdd}
        fields={[
          { key: 'run_1500m_s', label: 'Run 1500m', type: 'time', unit: 'mm:ss', placeholder: 'ex: 05:30' },
          { key: 'pull_ups', label: 'Pull-ups (max)', type: 'number', unit: 'reps' },
          { key: 'push_ups', label: 'Push-ups (max 2min)', type: 'number', unit: 'reps' },
          { key: 'sit_ups', label: 'Sit-ups (max 2min)', type: 'number', unit: 'reps' },
          { key: 'plank_s', label: 'Planche', type: 'time', unit: 'mm:ss', placeholder: 'ex: 02:00' },
        ]}
        protocol={
          <>
            <p><strong>Ordre recommandé :</strong></p>
            <p>1. Run 1500m à fond</p>
            <p>2. Pull-ups (max reps strict)</p>
            <p>3. Push-ups (max reps en 2min)</p>
            <p>4. Sit-ups (max reps en 2min)</p>
            <p>5. Planche (tenir le plus longtemps possible)</p>
            <p><strong>Repos :</strong> 5min entre chaque exercice</p>
          </>
        }
      />

      {/* BBJ — Broad Jump */}
      <TestCard
        title="BBJ — Burpee Broad Jump"
        description="Test de puissance explosive : 200m + 400m BBJ"
        testType="bbj"
        sport="hyrox"
        userId={userId}
        pastTests={tests}
        onAdd={onAdd}
        fields={[
          { key: 'time_200m_s', label: 'Temps 200m BBJ', type: 'time', unit: 'mm:ss', placeholder: 'ex: 04:30' },
          { key: 'time_400m_s', label: 'Temps 400m BBJ', type: 'time', unit: 'mm:ss', placeholder: 'ex: 09:45' },
          { key: 'reps_200m', label: 'Nombre de reps (200m)', type: 'number' },
          { key: 'reps_400m', label: 'Nombre de reps (400m)', type: 'number' },
          { key: 'avg_jump_cm', label: 'Saut moyen estimé', type: 'number', unit: 'cm' },
        ]}
        protocol={
          <>
            <p><strong>BBJ :</strong> Burpee + saut en longueur (sans marque au sol)</p>
            <p><strong>Test 1 :</strong> 200m de distance à couvrir en BBJ</p>
            <p><strong>Repos :</strong> 15min</p>
            <p><strong>Test 2 :</strong> 400m de distance à couvrir en BBJ</p>
            <p><strong>Objectif :</strong> Améliorer le saut moyen et le temps total</p>
          </>
        }
      />

      {/* Farmer Carry */}
      <TestCard
        title="Farmer Carry — Distance Max"
        description="Distance maximale avec les poids de compétition sans poser"
        testType="farmer_carry_max"
        sport="hyrox"
        userId={userId}
        pastTests={tests}
        onAdd={onAdd}
        fields={[
          { key: 'weight_kg', label: 'Poids par main', type: 'number', unit: 'kg' },
          { key: 'distance_m', label: 'Distance sans poser', type: 'number', unit: 'm' },
          { key: 'total_sets', label: 'Nombre de poses', type: 'number', placeholder: '0 = sans poser' },
          { key: 'total_distance_m', label: 'Distance totale', type: 'number', unit: 'm' },
        ]}
        protocol={
          <>
            <p><strong>Poids :</strong> Utiliser les poids de compétition de votre catégorie</p>
            <p><strong>Départ :</strong> Soulever les kettlebells des deux mains simultanément</p>
            <p><strong>Marcher</strong> le plus loin possible sans poser au sol</p>
            <p><strong>Si pose :</strong> Reprendre immédiatement — noter le nombre de poses</p>
            <p><strong>Objectif :</strong> Couvrir 200m (distance de compétition) sans poser</p>
          </>
        }
      />

      {/* Wall Ball */}
      <TestCard
        title="Wall Ball — Test 1min"
        description="Maximum de reps en 1 minute avec le medball de compétition"
        testType="wall_ball_1min"
        sport="hyrox"
        userId={userId}
        pastTests={tests}
        onAdd={onAdd}
        fields={[
          { key: 'ball_weight_kg', label: 'Poids medball', type: 'number', unit: 'kg', placeholder: 'ex: 6 ou 9' },
          { key: 'reps_1min', label: 'Reps en 1min', type: 'number' },
          { key: 'target_height_m', label: 'Hauteur cible', type: 'number', unit: 'm', placeholder: '3 ou 3.35' },
        ]}
        protocol={
          <>
            <p><strong>Hauteur cible :</strong> 3m (femmes) / 3.35m (hommes)</p>
            <p><strong>Poids :</strong> 6kg (femmes Open) / 9kg (hommes Open/Pro femmes)</p>
            <p><strong>Départ :</strong> Squat complet, medball contre la poitrine</p>
            <p><strong>Rep valide :</strong> Squat complet + impact au-dessus de la cible</p>
            <p><strong>Objectif :</strong> &gt;20 reps/min = très bon niveau</p>
          </>
        }
      />

      {/* Wall Ball — Test 5min */}
      <TestCard
        title="Wall Ball — Test 5min"
        description="Maximum de reps en 5 minutes (endurance de force)"
        testType="wall_ball_5min"
        sport="hyrox"
        userId={userId}
        pastTests={tests}
        onAdd={onAdd}
        fields={[
          { key: 'ball_weight_kg', label: 'Poids medball', type: 'number', unit: 'kg', placeholder: 'ex: 6 ou 9' },
          { key: 'reps_5min', label: 'Reps en 5min', type: 'number' },
          { key: 'reps_per_min', label: 'Reps/min moyen', type: 'number' },
          { key: 'target_height_m', label: 'Hauteur cible', type: 'number', unit: 'm', placeholder: '3 ou 3.35' },
        ]}
        protocol={
          <>
            <p><strong>Même protocole que le test 1min</strong> sur 5 minutes</p>
            <p><strong>Objectif :</strong> Maintenir un rythme stable sans pause</p>
            <p><strong>Indicateur :</strong> Ratio reps 5min / (reps 1min × 5) — viser &gt; 80%</p>
          </>
        }
      />

      {/* Run Compromised */}
      <TestCard
        title="Run Compromised"
        description="1km run → 100 wall balls → 1km run — mesure la dégradation de la course"
        testType="run_compromised"
        sport="hyrox"
        userId={userId}
        pastTests={tests}
        onAdd={onAdd}
        fields={[
          { key: 'run1_time', label: 'Run 1km avant (temps)', type: 'time', unit: 'mm:ss', placeholder: 'ex: 04:00' },
          { key: 'wall_balls_time', label: 'Temps 100 Wall Balls', type: 'time', unit: 'mm:ss', placeholder: 'ex: 06:00' },
          { key: 'run2_time', label: 'Run 1km après (temps)', type: 'time', unit: 'mm:ss', placeholder: 'ex: 04:30' },
          { key: 'total_time', label: 'Temps total', type: 'time', unit: 'mm:ss', placeholder: 'ex: 14:30' },
          { key: 'degradation_pct', label: 'Dégradation run', type: 'number', unit: '%', placeholder: 'ex: 12' },
          { key: 'ball_weight_kg', label: 'Poids medball', type: 'number', unit: 'kg' },
        ]}
        protocol={
          <>
            <p><strong>Structure :</strong> 1km course à fond → 100 Wall Balls → 1km course à fond</p>
            <p><strong>Dégradation</strong> = (T_run2 - T_run1) / T_run1 × 100</p>
            <p><strong>Interprétation :</strong></p>
            <p>— &lt; 5% : excellente résistance à la fatigue</p>
            <p>— 5-15% : bonne résistance</p>
            <p>— &gt; 15% : travail spécifique nécessaire</p>
            <p><strong>Objectif :</strong> Reproduire les conditions de compétition Hyrox</p>
          </>
        }
      />
    </div>
  )
}
