'use client'

import type { TestEntry } from './TestsSection'
import { TestCard } from './TestCard'

interface Props {
  userId: string
  tests: TestEntry[]
  onAdd: (t: TestEntry) => void
}

export function CyclismeTests({ userId, tests, onAdd }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400 mb-4">
        3 tests endurance pour suivre votre progression et calibrer vos zones d&apos;entraînement.
      </p>

      <TestCard
        title="Test Endurance 4h"
        description="Sortie longue à allure EF — mesure de la dérive cardiaque sur 4h"
        testType="endurance_4h"
        sport="bike"
        userId={userId}
        tests={tests}
        onAdd={onAdd}
        fields={[
          { key: 'duration_min', label: 'Durée réelle', type: 'number', unit: 'min' },
          { key: 'avg_hr', label: 'FC moyenne', type: 'number', unit: 'bpm' },
          { key: 'hr_first_hour', label: 'FC 1ère heure', type: 'number', unit: 'bpm' },
          { key: 'hr_last_hour', label: 'FC dernière heure', type: 'number', unit: 'bpm' },
          { key: 'avg_watts', label: 'Puissance moyenne', type: 'number', unit: 'W' },
          { key: 'decoupling_pct', label: 'Découplage', type: 'number', unit: '%' },
          { key: 'tss', label: 'TSS', type: 'number' },
        ]}
        protocol={
          <>
            <p><strong>Durée :</strong> 4h en continu (peut être réduit à 3h minimum)</p>
            <p><strong>Allure :</strong> Zone 2 — 65-75% FCmax ou 55-75% FTP</p>
            <p><strong>Mesures :</strong> Enregistrer FC moyenne par heure</p>
            <p><strong>Résultat :</strong> Découplage = (FC dernière heure - FC 1ère heure) / FC 1ère heure × 100</p>
            <p><strong>Objectif :</strong> Découplage &lt; 5% = excellente endurance aérobie</p>
          </>
        }
      />

      <TestCard
        title="Test EF Progressif"
        description="Mesure du facteur d'efficience aérobie (EF = Puissance / FC) sur plusieurs paliers"
        testType="progressive_ef"
        sport="bike"
        userId={userId}
        tests={tests}
        onAdd={onAdd}
        fields={[
          { key: 'ef_zone2', label: 'EF Zone 2', type: 'number', placeholder: 'ex: 1.85' },
          { key: 'ef_zone3', label: 'EF Zone 3', type: 'number', placeholder: 'ex: 2.10' },
          { key: 'hr_zone2', label: 'FC Zone 2', type: 'number', unit: 'bpm' },
          { key: 'watts_zone2', label: 'Watts Zone 2', type: 'number', unit: 'W' },
          { key: 'hr_zone3', label: 'FC Zone 3', type: 'number', unit: 'bpm' },
          { key: 'watts_zone3', label: 'Watts Zone 3', type: 'number', unit: 'W' },
        ]}
        protocol={
          <>
            <p><strong>Structure :</strong> 2× 20min par palier (Z2 puis Z3), avec 5min de récupération</p>
            <p><strong>EF :</strong> Puissance moyenne (W) ÷ FC moyenne (bpm)</p>
            <p><strong>Progrès :</strong> EF augmente avec la forme aérobie — suivre l&apos;évolution mensuelle</p>
            <p><strong>Référence :</strong> EF Z2 &gt; 2.0 = très bonne forme</p>
          </>
        }
      />

      <TestCard
        title="Test Endurance + FTP"
        description="Sortie 2h30 suivie d'un effort FTP 20min — évalue la résistance à la fatigue"
        testType="endurance_ftp"
        sport="bike"
        userId={userId}
        tests={tests}
        onAdd={onAdd}
        fields={[
          { key: 'endurance_avg_watts', label: 'Watts endurance (2h30)', type: 'number', unit: 'W' },
          { key: 'endurance_avg_hr', label: 'FC endurance', type: 'number', unit: 'bpm' },
          { key: 'ftp_test_watts', label: 'Watts effort FTP 20min', type: 'number', unit: 'W' },
          { key: 'ftp_test_hr', label: 'FC effort FTP', type: 'number', unit: 'bpm' },
          { key: 'ftp_estimated', label: 'FTP estimée (×0.95)', type: 'number', unit: 'W' },
          { key: 'tss', label: 'TSS total', type: 'number' },
        ]}
        protocol={
          <>
            <p><strong>Phase 1 :</strong> 2h30 en Zone 2 (65-75% FCmax)</p>
            <p><strong>Transition :</strong> 10min récupération active</p>
            <p><strong>Phase 2 :</strong> 20min à fond (effort max soutenu)</p>
            <p><strong>FTP estimée :</strong> Puissance 20min × 0.95</p>
            <p><strong>Objectif :</strong> Comparer la puissance fraîche vs après fatigue</p>
          </>
        }
      />
    </div>
  )
}
