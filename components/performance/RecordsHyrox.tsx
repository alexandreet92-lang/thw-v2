'use client'

import { useState } from 'react'
import type { RaceResultRow } from '@/app/(app)/performance/page'

interface Props {
  raceResults: RaceResultRow[]
}

const HYROX_STATIONS = [
  { key: 'ski_erg', label: 'SkiErg' },
  { key: 'sled_push', label: 'Sled Push' },
  { key: 'sled_pull', label: 'Sled Pull' },
  { key: 'burpee_jump', label: 'Burpee Broad Jump' },
  { key: 'rowing', label: 'Rowing' },
  { key: 'farmers_carry', label: "Farmer's Carry" },
  { key: 'sandbag_lunges', label: 'Sandbag Lunges' },
  { key: 'wall_balls', label: 'Wall Balls' },
]

function fmtTime(t: string | null | undefined): string {
  if (!t) return '—'
  return t
}

function parseTimeToSecs(t: string | null | undefined): number {
  if (!t) return 0
  const parts = t.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parseInt(t) || 0
}

export function RecordsHyrox({ raceResults }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (raceResults.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">Aucun résultat Hyrox enregistré.</p>
      </div>
    )
  }

  const sorted = [...raceResults].sort(
    (a, b) => new Date(b.race_date).getTime() - new Date(a.race_date).getTime()
  )

  return (
    <div className="space-y-3">
      {sorted.map((r) => {
        const isExpanded = expanded === r.id
        const stationTimes = (r.station_times ?? {}) as Record<string, string>
        const runSecs = parseTimeToSecs(r.split_run)
        const totalSecs = parseTimeToSecs(r.finish_time)
        const runPct = totalSecs > 0 && runSecs > 0 ? Math.round((runSecs / totalSecs) * 100) : null

        // Sum of station times
        const stationTotal = HYROX_STATIONS.reduce((sum, s) => {
          return sum + parseTimeToSecs(stationTimes[s.key])
        }, 0)
        const stationPct = totalSecs > 0 && stationTotal > 0 ? Math.round((stationTotal / totalSecs) * 100) : null

        return (
          <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setExpanded(isExpanded ? null : r.id)}
              className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{r.race_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {r.distance_label}
                    {r.category ? ` · ${r.category}` : ''}
                    {r.location ? ` · ${r.location}` : ''}
                    {' · '}
                    {new Date(r.race_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <div className="text-right">
                    {r.dnf ? (
                      <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">DNF</span>
                    ) : (
                      <p className="text-sm font-bold text-red-500">{r.finish_time}</p>
                    )}
                    {r.overall_rank && r.overall_total && (
                      <p className="text-xs text-gray-400">{r.overall_rank}/{r.overall_total}</p>
                    )}
                    {r.category_rank && (
                      <p className="text-xs text-gray-500">Cat. {r.category_rank}</p>
                    )}
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20" fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                {/* Run breakdown */}
                {(r.split_run || r.split_swim || r.split_bike) && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Splits de course</p>
                    <div className="grid grid-cols-3 gap-2">
                      {r.split_swim && (
                        <div className="bg-cyan-50 rounded-lg p-2.5 text-center">
                          <p className="text-xs text-cyan-600 font-medium">Natation</p>
                          <p className="text-sm font-bold text-cyan-700">{r.split_swim}</p>
                        </div>
                      )}
                      {r.split_t1 && (
                        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                          <p className="text-xs text-gray-500 font-medium">T1</p>
                          <p className="text-sm font-bold text-gray-700">{r.split_t1}</p>
                        </div>
                      )}
                      {r.split_bike && (
                        <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                          <p className="text-xs text-blue-600 font-medium">Vélo</p>
                          <p className="text-sm font-bold text-blue-700">{r.split_bike}</p>
                        </div>
                      )}
                      {r.split_t2 && (
                        <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                          <p className="text-xs text-gray-500 font-medium">T2</p>
                          <p className="text-sm font-bold text-gray-700">{r.split_t2}</p>
                        </div>
                      )}
                      {r.split_run && (
                        <div className="bg-red-50 rounded-lg p-2.5 text-center">
                          <p className="text-xs text-red-600 font-medium">Course</p>
                          <p className="text-sm font-bold text-red-700">{r.split_run}</p>
                        </div>
                      )}
                    </div>
                    {runPct !== null && (
                      <p className="text-xs text-gray-400 mt-2">
                        Run compromised : <span className="font-semibold text-red-500">{runPct}%</span> du temps total
                        {stationPct !== null && (
                          <span> · Stations : <span className="font-semibold">{stationPct}%</span></span>
                        )}
                      </p>
                    )}
                  </div>
                )}

                {/* 8 stations */}
                {Object.keys(stationTimes).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">8 Stations</p>
                    <div className="space-y-1.5">
                      {HYROX_STATIONS.map((s) => {
                        const t = stationTimes[s.key]
                        if (!t) return null
                        return (
                          <div key={s.key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{s.label}</span>
                            <span className="text-sm font-semibold text-red-500">{fmtTime(t)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {r.notes && (
                  <p className="text-xs text-gray-400 italic">{r.notes}</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
