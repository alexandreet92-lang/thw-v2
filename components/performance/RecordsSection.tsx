'use client'

import { useState } from 'react'
import type { PersonalRecord, RaceResultRow } from '@/app/(app)/performance/page'
import { RecordsCyclisme } from './RecordsCyclisme'
import { RecordsRun } from './RecordsRun'
import { RecordsNatation } from './RecordsNatation'
import { RecordsHyrox } from './RecordsHyrox'
import { RecordsTriathlon } from './RecordsTriathlon'

interface Props {
  personalRecords: PersonalRecord[]
  raceResults: RaceResultRow[]
}

type SportTab = 'cyclisme' | 'run' | 'natation' | 'hyrox' | 'triathlon'

const SPORT_TABS: { id: SportTab; label: string; color: string }[] = [
  { id: 'cyclisme', label: 'Cyclisme', color: '#3B82F6' },
  { id: 'run', label: 'Running', color: '#F97316' },
  { id: 'natation', label: 'Natation', color: '#06B6D4' },
  { id: 'hyrox', label: 'Hyrox', color: '#EF4444' },
  { id: 'triathlon', label: 'Triathlon', color: '#8B5CF6' },
]

export function RecordsSection({ personalRecords, raceResults }: Props) {
  const [tab, setTab] = useState<SportTab>('cyclisme')

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {SPORT_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              tab === t.id
                ? 'text-white border-transparent'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
            style={tab === t.id ? { backgroundColor: t.color, borderColor: t.color } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'cyclisme' && (
        <RecordsCyclisme
          personalRecords={personalRecords.filter((r) => r.sport === 'bike' || r.sport === 'virtual_bike')}
        />
      )}
      {tab === 'run' && (
        <RecordsRun
          personalRecords={personalRecords.filter((r) => r.sport === 'run')}
          raceResults={raceResults.filter((r) => r.sport === 'run')}
        />
      )}
      {tab === 'natation' && (
        <RecordsNatation
          personalRecords={personalRecords.filter((r) => r.sport === 'swim')}
          raceResults={raceResults.filter((r) => r.sport === 'swim')}
        />
      )}
      {tab === 'hyrox' && (
        <RecordsHyrox
          raceResults={raceResults.filter((r) => r.sport === 'hyrox')}
        />
      )}
      {tab === 'triathlon' && (
        <RecordsTriathlon
          raceResults={raceResults.filter((r) => r.sport === 'triathlon')}
        />
      )}
    </div>
  )
}
