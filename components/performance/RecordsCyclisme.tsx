'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import type { PersonalRecord } from '@/app/(app)/performance/page'

interface Props {
  personalRecords: PersonalRecord[]
}

const POWER_ORDER = ['Pmax', '10s', '30s', '1min', '5min', '20min', '1h', '2h', '5h']
const DURATION_S: Record<string, number> = {
  Pmax: 1, '10s': 10, '30s': 30, '1min': 60, '5min': 300,
  '20min': 1200, '1h': 3600, '2h': 7200, '5h': 18000,
}
const PALETTE = ['#3B82F6', '#F97316', '#8B5CF6', '#06B6D4', '#EF4444', '#22C55E', '#EC4899', '#EAB308']

function getYearColor(year: number, allYears: number[]): string {
  const sorted = [...allYears].sort((a, b) => b - a)
  const idx = sorted.indexOf(year)
  return PALETTE[idx % PALETTE.length] ?? '#6B7280'
}

function fmtWatts(w: number): string {
  return `${Math.round(w)} W`
}

export function RecordsCyclisme({ personalRecords }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; year: number; watts: number } | null>(null)
  const [activeYears, setActiveYears] = useState<Set<number> | null>(null)

  // Power curve data grouped by year
  const powerByYear = useMemo(() => {
    const map = new Map<number, Map<string, number>>()
    for (const r of personalRecords) {
      if (r.performance_unit !== 'watts') continue
      const w = parseFloat(r.performance)
      if (isNaN(w)) continue
      const yr = r.year ?? new Date(r.achieved_at).getFullYear()
      if (!map.has(yr)) map.set(yr, new Map())
      const existing = map.get(yr)!.get(r.distance_label)
      if (!existing || w > existing) map.get(yr)!.set(r.distance_label, w)
    }
    return map
  }, [personalRecords])

  const allYears = useMemo(() => Array.from(powerByYear.keys()).sort((a, b) => b - a), [powerByYear])

  useEffect(() => {
    if (activeYears === null && allYears.length > 0) {
      setActiveYears(new Set(allYears))
    }
  }, [allYears, activeYears])

  const visibleYears = activeYears ?? new Set(allYears)

  // Climb records
  const climbRecords = personalRecords.filter(
    (r) => r.performance_unit === 'seconds' && r.terrain_type === 'climb'
  )

  // SVG chart
  const W = 600, H = 220, PL = 48, PR = 16, PT = 16, PB = 32
  const chartW = W - PL - PR
  const chartH = H - PT - PB

  const labels = POWER_ORDER.filter((l) => {
    for (const yr of Array.from(visibleYears)) {
      if (powerByYear.get(yr)?.has(l)) return true
    }
    return false
  })

  const allWatts = Array.from(visibleYears).flatMap((yr) =>
    labels.map((l) => powerByYear.get(yr)?.get(l)).filter((v): v is number => v !== undefined)
  )
  const minW = allWatts.length > 0 ? Math.min(...allWatts) * 0.9 : 0
  const maxW = allWatts.length > 0 ? Math.max(...allWatts) * 1.1 : 400

  function xPos(label: string): number {
    const idx = labels.indexOf(label)
    return idx < 0 ? 0 : PL + (idx / Math.max(labels.length - 1, 1)) * chartW
  }
  function yPos(w: number): number {
    return PT + chartH - ((w - minW) / (maxW - minW)) * chartH
  }

  const gridLines = 4
  const gridWatts = Array.from({ length: gridLines + 1 }, (_, i) =>
    minW + ((maxW - minW) * i) / gridLines
  )

  if (personalRecords.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">Aucun record cyclisme enregistré.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Power curve */}
      {allYears.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">Courbe de puissance</p>
              <p className="text-xs text-gray-400">Records personnels par durée</p>
            </div>
            <div className="flex gap-1.5 flex-wrap justify-end">
              {allYears.map((yr) => (
                <button
                  key={yr}
                  onClick={() =>
                    setActiveYears((prev) => {
                      const s = new Set(prev ?? allYears)
                      if (s.has(yr)) {
                        if (s.size > 1) s.delete(yr)
                      } else {
                        s.add(yr)
                      }
                      return new Set(s)
                    })
                  }
                  className="px-2.5 py-1 rounded-md text-xs font-medium border transition-all"
                  style={
                    visibleYears.has(yr)
                      ? { backgroundColor: getYearColor(yr, allYears), color: '#fff', borderColor: getYearColor(yr, allYears) }
                      : { backgroundColor: '#F9FAFB', color: '#9CA3AF', borderColor: '#E5E7EB' }
                  }
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              style={{ height: 220 }}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Grid */}
              {gridWatts.map((gw) => {
                const gy = yPos(gw)
                return (
                  <g key={gw}>
                    <line x1={PL} y1={gy} x2={W - PR} y2={gy} stroke="#F3F4F6" strokeWidth={1} />
                    <text x={PL - 4} y={gy + 4} textAnchor="end" fontSize={9} fill="#9CA3AF">
                      {Math.round(gw)}
                    </text>
                  </g>
                )
              })}

              {/* X labels */}
              {labels.map((l) => (
                <text key={l} x={xPos(l)} y={H - 6} textAnchor="middle" fontSize={9} fill="#9CA3AF">
                  {l}
                </text>
              ))}

              {/* Lines per year */}
              {Array.from(visibleYears).sort((a, b) => a - b).map((yr) => {
                const color = getYearColor(yr, allYears)
                const pts = labels
                  .map((l) => ({ l, w: powerByYear.get(yr)?.get(l) }))
                  .filter((p): p is { l: string; w: number } => p.w !== undefined)

                if (pts.length === 0) return null

                const d = pts
                  .map((p, i) => `${i === 0 ? 'M' : 'L'}${xPos(p.l)},${yPos(p.w)}`)
                  .join(' ')

                return (
                  <g key={yr}>
                    <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
                    {pts.map((p) => (
                      <circle
                        key={p.l}
                        cx={xPos(p.l)}
                        cy={yPos(p.w)}
                        r={4}
                        fill={color}
                        stroke="#fff"
                        strokeWidth={1.5}
                        className="cursor-pointer"
                        onMouseEnter={(e) => {
                          const rect = svgRef.current?.getBoundingClientRect()
                          if (!rect) return
                          setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, label: p.l, year: yr, watts: p.w })
                        }}
                      />
                    ))}
                  </g>
                )
              })}

              {/* Tooltip */}
              {tooltip && (
                <g>
                  <rect
                    x={Math.min(tooltip.x + 8, W - 90)}
                    y={tooltip.y - 28}
                    width={82}
                    height={34}
                    rx={6}
                    fill="#111827"
                    opacity={0.9}
                  />
                  <text x={Math.min(tooltip.x + 12, W - 86)} y={tooltip.y - 14} fontSize={10} fill="#fff" fontWeight="600">
                    {tooltip.label} — {tooltip.year}
                  </text>
                  <text x={Math.min(tooltip.x + 12, W - 86)} y={tooltip.y} fontSize={10} fill="#fff">
                    {fmtWatts(tooltip.watts)}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>
      )}

      {/* Power records table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-sm font-semibold text-gray-800 mb-3">Records de puissance</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Durée</th>
                {allYears.map((yr) => (
                  <th key={yr} className="text-right py-2 px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: getYearColor(yr, allYears) }}>
                    {yr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {POWER_ORDER.map((label) => {
                const hasAny = allYears.some((yr) => powerByYear.get(yr)?.has(label))
                if (!hasAny) return null
                const yearBest = allYears.map((yr) => powerByYear.get(yr)?.get(label) ?? null)
                const allBest = Math.max(...yearBest.filter((v): v is number => v !== null))
                return (
                  <tr key={label} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 pr-4 text-gray-700 font-medium">{label}</td>
                    {yearBest.map((w, i) => (
                      <td key={allYears[i]} className="py-2.5 px-3 text-right">
                        {w !== null ? (
                          <span
                            className="font-semibold"
                            style={{ color: w === allBest ? '#3B82F6' : '#374151' }}
                          >
                            {fmtWatts(w)}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Climb records */}
      {climbRecords.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-800 mb-3">Meilleures performances en montée</p>
          <div className="space-y-1">
            {climbRecords
              .sort((a, b) => new Date(b.achieved_at).getTime() - new Date(a.achieved_at).getTime())
              .map((r) => {
                const secs = parseInt(r.performance)
                const mm = Math.floor(secs / 60)
                const ss = secs % 60
                return (
                  <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm text-gray-700 font-medium">{r.distance_label}</p>
                      {r.race_location && <p className="text-xs text-gray-400">{r.race_location}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{mm}:{ss.toString().padStart(2, '0')}</p>
                      <p className="text-xs text-gray-400">{r.year ?? new Date(r.achieved_at).getFullYear()}</p>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
