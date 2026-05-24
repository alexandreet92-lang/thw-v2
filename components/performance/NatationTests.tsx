'use client'

import type { TestEntry } from './TestsSection'
import { TestCard } from './TestCard'

interface Props {
  userId: string
  tests: TestEntry[]
  onAdd: (t: TestEntry) => void
}

export function NatationTests({ userId, tests, onAdd }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 mb-4">
        Test de tolérance hypoxique — évalue la capacité à nager sans respirer.
      </p>

      <TestCard
        title="Test Hypoxie Crawl"
        description="Distance maximale en crawl sans prendre de respiration"
        testType="hypoxie_crawl"
        sport="swim"
        userId={userId}
        pastTests={tests}
        onAdd={onAdd}
        fields={[
          { key: 'distance_m', label: 'Distance sans respiration', type: 'number', unit: 'm', placeholder: 'ex: 25' },
          { key: 'pool_length', label: 'Longueur bassin', type: 'number', unit: 'm', placeholder: '25 ou 50' },
          { key: 'total_laps', label: 'Nombre de longueurs', type: 'number' },
          { key: 'perceived_effort', label: 'Effort perçu (1-10)', type: 'number', placeholder: 'ex: 8' },
        ]}
        protocol={
          <>
            <p><strong>Départ :</strong> Au bord du bassin, après inspiration normale (pas maximale)</p>
            <p><strong>Consigne :</strong> Nager en crawl sans prendre la moindre respiration</p>
            <p><strong>Arrêt :</strong> Dès le premier besoin impératif de respirer</p>
            <p><strong>Repos :</strong> 5min minimum avant de refaire si souhaité</p>
            <p><strong>Interprétation :</strong></p>
            <p>— &lt; 15m : faible tolérance hypoxique</p>
            <p>— 15-25m : moyenne</p>
            <p>— &gt; 25m : bonne tolérance</p>
            <p>— &gt; 50m : excellente</p>
          </>
        }
      />

      <TestCard
        title="Test CSS (Critical Swim Speed)"
        description="Vitesse critique de nage — analogue du seuil lactique en natation"
        testType="css_swim"
        sport="swim"
        userId={userId}
        pastTests={tests}
        onAdd={onAdd}
        fields={[
          { key: 'time_400m_s', label: 'Temps 400m', type: 'time', unit: 'mm:ss', placeholder: 'ex: 06:30' },
          { key: 'time_200m_s', label: 'Temps 200m', type: 'time', unit: 'mm:ss', placeholder: 'ex: 03:00' },
          { key: 'css_pace', label: 'Allure CSS calculée', type: 'time', unit: 'mm:ss/100m', placeholder: 'ex: 01:45' },
          { key: 'pool_length', label: 'Longueur bassin', type: 'number', unit: 'm', placeholder: '25 ou 50' },
        ]}
        protocol={
          <>
            <p><strong>Structure :</strong> 400m à fond + 10min repos + 200m à fond</p>
            <p><strong>CSS = (400 - 200) / (T400 - T200)</strong> en mètres/seconde</p>
            <p><strong>Allure CSS</strong> = 100 / CSS en secondes par 100m</p>
            <p><strong>Utilisation :</strong> Zone seuil pour les intervalles de nage</p>
          </>
        }
      />
    </div>
  )
}
