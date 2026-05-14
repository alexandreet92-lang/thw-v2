'use client'

import { useMemo, useState } from 'react'
import type { ActivityVolume } from '@/app/(app)/performance/page'
import { SPORT_COLORS, SPORT_ORDER } from '@/lib/constants/sports'

interface Props {
  volumes: ActivityVolume[]
}

const SPORT_LABELS: Record<string, string> = {
  bike: 'Vélo',
  virtual_bike: 'Vélo indoor',
  run: 'Running',
  gym: 'Gym',
  hyrox: 'Hyrox',
  swim: 'Natation',
  other: 'Autre',
  hiit: 'HIIT',
}

function fmtHours(totalHours: number): string {
  const h = Math.floor(totalHours)
  const m = Math.round((totalHours - h) * 60)
  return `${h}h${m.toString().padStart(2, '0')}`
}

type ViewMode = 'hours' | 'sessions' | 'distance'

export function YearDatasSection({ volumes }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('hours')

  const years = useMemo(() => {
    const yrs = new Set(volumes.map((v) => v.year))
    return Array.from(yrs).sort((a, b) => b - a)
  }, [volumes])

  const sports = useMemo(() => {
    const sp = new Set(volumes.map((v) => v.sport_type))
    return SPORT_ORDER.filter((s) => sp.has(s)).concat(Array.from(sp).filter((s) => !SPORT_ORDER.includes(s)))
  }, [volumes])

  // Aggregate by year
  const byYear = useMemo(() => {
    const map = new Map<number, { total_hours: number; sessions: number; distance: number; bySport: Map<string, ActivityVolume> }>()
    for (const v of volumes) {
      if (!map.has(v.year)) {
        map.set(v.year, { total_hours: 0, sessions: 0, distance: 0, bySport: new Map() })
      }
      const y = map.get(v.year)!
      y.total_hours += v.total_hours
      y.sessions += v.sessions
      y.distance += v.total_distance_km
      y.bySport.set(v.sport_type, v)
    }
    return map
  }, [volumes])

  const maxVal = useMemo(() => {
    let m = 0
    for (const [, y] of Array.from(byYear.entries())) {
      const val = viewMode === 'hours' ? y.total_hours : viewMode === 'sessions' ? y.sessions : y.distance
      if (val > m) m = val
    }
    return m || 1
  }, [byYear, viewMode])

  if (volumes.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">Aucune donnée d'activité.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* View selector */}
      <div className="flex gap-2">
        {([['hours', 'Heures'], ['sessions', 'Séances'], ['distance', 'Distance']] as [ViewMode, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setViewMode(id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              viewMode === id
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Year cards */}
      {years.map((yr) => {
        const y = byYear.get(yr)
        if (!y) return null
        const totalVal = viewMode === 'hours' ? y.total_hours : viewMode === 'sessions' ? y.sessions : y.distance

        return (
          <div key={yr} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-base font-bold text-gray-900">{yr}</p>
              <div className="flex gap-3 text-xs text-gray-400">
                <span>{fmtHours(y.total_hours)}</span>
                <span>{y.sessions} séances</span>
                <span>{Math.round(y.distance)} km</span>
              </div>
            </div>

            {/* Stacked bar */}
            <div className="h-8 rounded-lg overflow-hidden flex mb-3" style={{ gap: 2 }}>
              {sports.map((sport) => {
                const v = y.bySport.get(sport)
                if (!v) return null
                const val = viewMode === 'hours' ? v.total_hours : viewMode === 'sessions' ? v.sessions : v.total_distance_km
                const widthPct = (val / maxVal) * 100
                if (widthPct < 0.5) return null
                return (
                  <div
                    key={sport}
                    style={{ width: `${widthPct}%`, backgroundColor: SPORT_COLORS[sport] ?? '#6B7280', minWidth: 4 }}
                    title={`${SPORT_LABELS[sport] ?? sport}: ${viewMode === 'hours' ? fmtHours(val) : viewMode === 'distance' ? `${Math.round(val)} km` : `${val} séances`}`}
                    className="rounded-sm transition-all"
                  />
                )
              })}
            </div>

            {/* Sport breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sports.map((sport) => {
                const v = y.bySport.get(sport)
                if (!v) return null
                const val = viewMode === 'hours' ? v.total_hours : viewMode === 'sessions' ? v.sessions : v.total_distance_km
                const color = SPORT_COLORS[sport] ?? '#6B7280'
                return (
                  <div key={sport} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 truncate">{SPORT_LABELS[sport] ?? sport}</p>
                      <p className="text-xs font-semibold text-gray-800">
                        {viewMode === 'hours' ? fmtHours(val) : viewMode === 'distance' ? `${Math.round(val)} km` : `${val} séances`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Summary table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-sm font-semibold text-gray-800 mb-3">Récapitulatif par sport</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sport</th>
                {years.map((yr) => (
                  <th key={yr} className="text-right py-2 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{yr}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sports.map((sport) => {
                const color = SPORT_COLORS[sport] ?? '#6B7280'
                return (
                  <tr key={sport} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-gray-700">{SPORT_LABELS[sport] ?? sport}</span>
                      </div>
                    </td>
                    {years.map((yr) => {
                      const v = byYear.get(yr)?.bySport.get(sport)
                      if (!v) return <td key={yr} className="py-2 px-2 text-right text-gray-200 text-xs">—</td>
                      const val = viewMode === 'hours' ? v.total_hours : viewMode === 'sessions' ? v.sessions : v.total_distance_km
                      return (
                        <td key={yr} className="py-2 px-2 text-right text-xs font-semibold text-gray-700">
                          {viewMode === 'hours' ? fmtHours(val) : viewMode === 'distance' ? `${Math.round(val)} km` : `${val}`}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
