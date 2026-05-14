'use client'

import { useMemo, useState } from 'react'
import type { ActivityStat } from '@/app/(app)/training/page'
import { SPORT_COLORS, SPORT_LABELS, SPORT_ORDER } from '@/lib/constants/sports'

interface Props {
  stats: ActivityStat[]
}

function formatHours(h: number): string {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh}h${mm.toString().padStart(2, '0')}`
}

export function TrainingStats({ stats }: Props) {
  const years = useMemo(() => {
    const s = new Set(stats.map((s) => s.year))
    return Array.from(s).sort((a, b) => b - a)
  }, [stats])

  const [selectedYear, setSelectedYear] = useState<number>(years[0] ?? new Date().getFullYear())

  const yearStats = useMemo(() => {
    return stats.filter((s) => s.year === selectedYear)
  }, [stats, selectedYear])

  const totalHours = yearStats.reduce((acc, s) => acc + s.total_hours, 0)
  const totalSessions = yearStats.reduce((acc, s) => acc + s.sessions, 0)

  // Sort by SPORT_ORDER
  const sorted = useMemo(() => {
    return [...yearStats].sort(
      (a, b) =>
        (SPORT_ORDER.indexOf(a.sport_type) === -1 ? 99 : SPORT_ORDER.indexOf(a.sport_type)) -
        (SPORT_ORDER.indexOf(b.sport_type) === -1 ? 99 : SPORT_ORDER.indexOf(b.sport_type))
    )
  }, [yearStats])

  const maxHours = Math.max(...sorted.map((s) => s.total_hours), 1)

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-700">Volume par sport</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatHours(totalHours)} · {totalSessions} séances
          </p>
        </div>
        <div className="flex gap-1 flex-wrap justify-end">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedYear === y
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Aucune donnée pour {selectedYear}</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((s) => {
            const color = SPORT_COLORS[s.sport_type] ?? SPORT_COLORS.other
            const label = SPORT_LABELS[s.sport_type] ?? s.sport_type
            const widthPct = (s.total_hours / maxHours) * 100

            return (
              <div key={s.sport_type} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-semibold text-gray-800">{formatHours(s.total_hours)}</span>
                    <span>{s.sessions} séances</span>
                    {s.avg_watts !== null && (
                      <span className="text-gray-400">{Math.round(s.avg_watts)}W moy.</span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${widthPct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Légende couleurs pour cohérence globale */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex flex-wrap gap-2">
        {SPORT_ORDER.map((sport) => (
          <div key={sport} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: SPORT_COLORS[sport] }}
            />
            <span className="text-xs text-gray-400">{SPORT_LABELS[sport]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
