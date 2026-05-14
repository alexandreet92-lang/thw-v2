'use client'

import { useState } from 'react'
import type {
  AthleteProfile,
  TrainingZoneRow,
  PersonalRecord,
  RaceResultRow,
  ActivityVolume,
  SportProfileRow,
} from '@/app/(app)/performance/page'
import { ProfilSection } from './ProfilSection'
import { RecordsSection } from './RecordsSection'
import { YearDatasSection } from './YearDatasSection'
import { TestsSection } from './TestsSection'

type Tab = 'profil' | 'records' | 'yeardata' | 'tests'

interface Props {
  profile: AthleteProfile | null
  zones: TrainingZoneRow[]
  personalRecords: PersonalRecord[]
  raceResults: RaceResultRow[]
  volumes: ActivityVolume[]
  sportProfiles: SportProfileRow[]
  userId: string
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'profil', label: 'Profil', icon: '👤' },
  { id: 'records', label: 'Records', icon: '🏆' },
  { id: 'yeardata', label: 'Year Datas', icon: '📊' },
  { id: 'tests', label: 'Tests', icon: '🧪' },
]

export function PerformanceClient({
  profile,
  zones,
  personalRecords,
  raceResults,
  volumes,
  sportProfiles,
  userId,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('profil')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-6 pt-5 pb-0">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Performance</h1>
          <p className="text-sm text-gray-400 mt-0.5 mb-3">Profil athlète, records et tests</p>
          <div className="flex gap-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {activeTab === 'profil' && (
          <ProfilSection
            profile={profile}
            zones={zones}
            sportProfiles={sportProfiles}
            userId={userId}
          />
        )}
        {activeTab === 'records' && (
          <RecordsSection
            personalRecords={personalRecords}
            raceResults={raceResults}
          />
        )}
        {activeTab === 'yeardata' && (
          <YearDatasSection volumes={volumes} />
        )}
        {activeTab === 'tests' && (
          <TestsSection userId={userId} />
        )}
      </div>
    </div>
  )
}
