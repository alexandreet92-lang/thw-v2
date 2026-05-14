'use client'

import { useState } from 'react'
import type { RaceResultRow } from '@/app/(app)/performance/page'

interface Props {
  raceResults: RaceResultRow[]
}

function parseTimeToSecs(t: string | null | undefined): number {
  if (!t) return 0
  const parts = t.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parseInt(t) || 0
}

function pct(part: string | null, total: string | null): string {
  const p = parseTimeToSecs(part)
  const t = parseTimeToSecs(total)
  if (!p || !t) return ''
  return `${Math.round((p / t) * 100)}%`
}

export function RecordsTriathlon({ raceResults }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (raceResults.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">Aucun résultat triathlon enregistré.</p>
      </div>
    )
  }

  const sorted = [...raceResults].sort(
    (a, b) => new Date(b.race_date).getTime() - new Date(a.race_date).getTime()
  )

  // Group by distance
  const byDistance = new Map<string, RaceResultRow[]>()
  for (const r of sorted) {
    if (!byDistance.has(r.distance_label)) byDistance.set(r.distance_label, [])
    byDistance.get(r.distance_label)!.push(r)
  }

  return (
    <div className="space-y-5">
      {/* Best by distance */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-sm font-semibold text-gray-800 mb-3">Meilleurs temps par distance</p>
        <div className="space-y-2">
          {[...byDistance.entries()].map(([dist, races]) => {
            const best = races
              .filter((r) => !r.dnf && !r.dns)
              .sort((a, b) => parseTimeToSecs(a.finish_time) - parseTimeToSecs(b.finish_time))[0]
            if (!best) return null
            return (
              <div key={dist} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">{dist}</p>
                  <p className="text-xs text-gray-400">{best.race_name} · {best.year ?? new Date(best.race_date).getFullYear()}</p>
                </div>
                <p className="text-sm font-bold text-purple-600">{best.finish_time}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* All races */}
      <div className="space-y-3">
        {sorted.map((r) => {
          const isExpanded = expanded === r.id
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
                      {r.location ? ` · ${r.location}` : ''}
                      {' · '}
                      {new Date(r.race_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      {r.dnf ? (
                        <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">DNF</span>
                      ) : r.dns ? (
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded">DNS</span>
                      ) : (
                        <p className="text-sm font-bold text-purple-600">{r.finish_time}</p>
                      )}
                      {r.overall_rank && r.overall_total && (
                        <p className="text-xs text-gray-400">{r.overall_rank}/{r.overall_total}</p>
                      )}
                      {r.category && r.category_rank && (
                        <p className="text-xs text-gray-500">{r.category} · {r.category_rank}</p>
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
                  {/* Splits */}
                  {(r.split_swim || r.split_bike || r.split_run) && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Splits</p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {r.split_swim && (
                          <div className="bg-cyan-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-cyan-600 font-medium">Natation</p>
                            <p className="text-sm font-bold text-cyan-700">{r.split_swim}</p>
                            <p className="text-xs text-cyan-500">{pct(r.split_swim, r.finish_time)}</p>
                          </div>
                        )}
                        {r.split_t1 && (
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-500 font-medium">T1</p>
                            <p className="text-sm font-bold text-gray-700">{r.split_t1}</p>
                          </div>
                        )}
                        {r.split_bike && (
                          <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-blue-600 font-medium">Vélo</p>
                            <p className="text-sm font-bold text-blue-700">{r.split_bike}</p>
                            <p className="text-xs text-blue-500">{pct(r.split_bike, r.finish_time)}</p>
                          </div>
                        )}
                        {r.split_t2 && (
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-500 font-medium">T2</p>
                            <p className="text-sm font-bold text-gray-700">{r.split_t2}</p>
                          </div>
                        )}
                        {r.split_run && (
                          <div className="bg-orange-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-orange-600 font-medium">Course</p>
                            <p className="text-sm font-bold text-orange-700">{r.split_run}</p>
                            <p className="text-xs text-orange-500">{pct(r.split_run, r.finish_time)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {r.notes && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                      <p className="text-sm text-gray-600">{r.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
