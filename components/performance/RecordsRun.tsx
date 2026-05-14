'use client'

import { useMemo } from 'react'
import type { PersonalRecord, RaceResultRow } from '@/app/(app)/performance/page'

interface Props {
  personalRecords: PersonalRecord[]
  raceResults: RaceResultRow[]
}

const DISTANCE_ORDER = [
  '400m', '800m', '1000m', '1500m', '1 mile', '3km', '5km', '10km',
  'Semi', 'Marathon', '50km', '100km', 'Trail',
]

function fmtTime(performance: string, unit: string): string {
  if (unit === 'seconds') {
    const s = parseInt(performance)
    if (isNaN(s)) return performance
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}h${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
    return `${m}:${sec.toString().padStart(2, '0')}`
  }
  return `${performance} ${unit}`
}

function parseSeconds(performance: string, unit: string): number {
  if (unit === 'seconds') return parseInt(performance) || 0
  return 0
}

export function RecordsRun({ personalRecords, raceResults }: Props) {
  // Group PR by distance
  const prByDistance = useMemo(() => {
    const map = new Map<string, PersonalRecord[]>()
    for (const r of personalRecords) {
      if (!map.has(r.distance_label)) map.set(r.distance_label, [])
      map.get(r.distance_label)!.push(r)
    }
    return map
  }, [personalRecords])

  const allYears = useMemo(() => {
    const yrs = new Set<number>()
    personalRecords.forEach((r) => {
      const y = r.year ?? new Date(r.achieved_at).getFullYear()
      yrs.add(y)
    })
    return Array.from(yrs).sort((a, b) => b - a)
  }, [personalRecords])

  // Best PR per year per distance
  const bestByYearDist = useMemo(() => {
    const map = new Map<string, Map<number, PersonalRecord>>() // key: distance
    for (const r of personalRecords) {
      const yr = r.year ?? new Date(r.achieved_at).getFullYear()
      const key = r.distance_label
      if (!map.has(key)) map.set(key, new Map())
      const existing = map.get(key)!.get(yr)
      if (!existing) {
        map.get(key)!.set(yr, r)
      } else {
        const newSecs = parseSeconds(r.performance, r.performance_unit)
        const oldSecs = parseSeconds(existing.performance, existing.performance_unit)
        if (newSecs > 0 && (oldSecs === 0 || newSecs < oldSecs)) {
          map.get(key)!.set(yr, r)
        }
      }
    }
    return map
  }, [personalRecords])

  const distances = useMemo(() => {
    const all = Array.from(prByDistance.keys())
    return [...DISTANCE_ORDER.filter((d) => all.includes(d)), ...all.filter((d) => !DISTANCE_ORDER.includes(d))]
  }, [prByDistance])

  if (personalRecords.length === 0 && raceResults.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">Aucun record running enregistré.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* PR table by year */}
      {distances.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-800 mb-1">Records personnels</p>
          <p className="text-xs text-gray-400 mb-3">Meilleure performance par distance et par année</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider min-w-[80px]">Distance</th>
                  {allYears.map((yr) => (
                    <th key={yr} className="text-right py-2 px-3 text-xs font-semibold text-orange-500 uppercase tracking-wider">
                      {yr}
                    </th>
                  ))}
                  <th className="text-right py-2 pl-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Meilleur</th>
                </tr>
              </thead>
              <tbody>
                {distances.map((dist) => {
                  const byYear = bestByYearDist.get(dist)
                  const allPerfs = Array.from(byYear?.values() ?? [])
                  const bestSecs = allPerfs.reduce((best, r) => {
                    const s = parseSeconds(r.performance, r.performance_unit)
                    return s > 0 && (best === 0 || s < best) ? s : best
                  }, 0)
                  return (
                    <tr key={dist} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 pr-4 text-gray-700 font-medium">{dist}</td>
                      {allYears.map((yr) => {
                        const r = byYear?.get(yr)
                        if (!r) return <td key={yr} className="py-2.5 px-3 text-right text-gray-200">—</td>
                        const secs = parseSeconds(r.performance, r.performance_unit)
                        const isBest = secs > 0 && secs === bestSecs
                        return (
                          <td key={yr} className="py-2.5 px-3 text-right">
                            <span
                              className="font-semibold"
                              style={{ color: isBest ? '#F97316' : '#374151' }}
                            >
                              {fmtTime(r.performance, r.performance_unit)}
                            </span>
                          </td>
                        )
                      })}
                      <td className="py-2.5 pl-3 text-right">
                        {bestSecs > 0 ? (
                          <span className="font-bold text-orange-500">
                            {fmtTime(bestSecs.toString(), 'seconds')}
                          </span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Race results */}
      {raceResults.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-800 mb-3">Résultats de course</p>
          <div className="space-y-1">
            {raceResults.map((r) => (
              <div key={r.id} className="py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.race_name}</p>
                    <p className="text-xs text-gray-400">
                      {r.distance_label}
                      {r.location ? ` · ${r.location}` : ''}
                      {' · '}
                      {new Date(r.race_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    {r.dnf ? (
                      <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">DNF</span>
                    ) : r.dns ? (
                      <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded">DNS</span>
                    ) : (
                      <p className="text-sm font-bold text-orange-500">{r.finish_time}</p>
                    )}
                    {r.overall_rank && r.overall_total && (
                      <p className="text-xs text-gray-400">{r.overall_rank}/{r.overall_total}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
