'use client'

import { useState } from 'react'
import type { AthleteProfile, TrainingZoneRow, SportProfileRow } from '@/app/(app)/performance/page'
import { ProfileGlobal } from './ProfileGlobal'
import { ProfileSpecific } from './ProfileSpecific'

interface Props {
  profile: AthleteProfile | null
  zones: TrainingZoneRow[]
  sportProfiles: SportProfileRow[]
  userId: string
}

type SubTab = 'global' | 'specific'

export function ProfilSection({ profile, zones, sportProfiles, userId }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('global')

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {(['global', 'specific'] as SubTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              subTab === t
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {t === 'global' ? 'Global' : 'Spécifique par sport'}
          </button>
        ))}
      </div>

      {subTab === 'global' && <ProfileGlobal profile={profile} zones={zones} />}
      {subTab === 'specific' && (
        <ProfileSpecific zones={zones} sportProfiles={sportProfiles} userId={userId} />
      )}
    </div>
  )
}
