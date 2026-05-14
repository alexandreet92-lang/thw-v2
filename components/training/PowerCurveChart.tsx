'use client'

import { useMemo, useState, useCallback } from 'react'
import type { PowerCurvePoint } from '@/app/(app)/training/page'

interface Props {
  data: PowerCurvePoint[]
}

// Duration labels → seconds
const DURATION_ORDER: Record<string, number> = {
  Pmax: 5,
  '5s': 5,
  '10s': 10,
  '15s': 15,
  '30s': 30,
  '1min': 60,
  '2min': 120,
  '3min': 180,
  '5min': 300,
  '8min': 480,
  '10min': 600,
  '15min': 900,
  '20min': 1200,
  '30min': 1800,
  '45min': 2700,
  '1h': 3600,
  '90min': 5400,
  '2h': 7200,
  '3h': 10800,
  '5h': 18000,
}

function labelToSeconds(label: string): number {
  return DURATION_ORDER[label] ?? 0
}

function formatDuration(label: string): string {
  return label
}

const PALETTE = [
  '#3B82F6', '#F97316', '#8B5CF6', '#06B6D4',
  '#EF4444', '#22C55E', '#EC4899', '#EAB308',
]

function getYearColor(year: number, allYears: number[]): string {
  const sorted = [...allYears].sort((a, b) => b - a)
  const idx = sorted.indexOf(year)
  return PALETTE[idx % PALETTE.length] ?? '#6B7280'
}

const W = 460
const H = 240
const PAD = { top: 16, right: 16, bottom: 40, left: 48 }
const CHART_W = W - PAD.left - PAD.right
const CHART_H = H - PAD.top - PAD.bottom

export function PowerCurveChart({ data }: Props) {
  const years = useMemo(() => {
    const s = new Set(data.map((d) => d.year))
    return Array.from(s).sort((a, b) => b - a)
  }, [data])

  const [selectedYears, setSelectedYears] = useState<Set<number>>(
    () => new Set(years.slice(0, 3))
  )
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; watts: number; year: number } | null>(null)

  const toggleYear = useCallback((y: number) => {
    setSelectedYears((prev) => {
      const next = new Set(prev)
      if (next.has(y)) {
        if (next.size > 1) next.delete(y)
      } else {
        next.add(y)
      }
      return next
    })
  }, [])

  // Group by year, sort by duration seconds
  const byYear = useMemo(() => {
    const map = new Map<number, PowerCurvePoint[]>()
    for (const d of data) {
      if (!selectedYears.has(d.year)) continue
      const arr = map.get(d.year) ?? []
      arr.push(d)
      map.set(d.year, arr)
    }
    for (const [year, arr] of map) {
      map.set(
        year,
        arr.sort((a, b) => labelToSeconds(a.distance_label) - labelToSeconds(b.distance_label))
      )
    }
    return map
  }, [data, selectedYears])

  // All points for scale
  const allPoints = useMemo(
    () => Array.from(byYear.values()).flat(),
    [byYear]
  )

  // Collect sorted unique labels
  const allLabels = useMemo(() => {
    const s = new Set(allPoints.map((d) => d.distance_label))
    return Array.from(s).sort((a, b) => labelToSeconds(a) - labelToSeconds(b))
  }, [allPoints])

  const maxW = useMemo(() => Math.max(...allPoints.map((d) => d.value), 1) * 1.08, [allPoints])
  const minW = useMemo(() => Math.min(...allPoints.map((d) => d.value), 0) * 0.92, [allPoints])

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-700 mb-1">Courbe de puissance</p>
        <p className="text-xs text-gray-400 mb-4">Cyclisme · Meilleure puissance par durée</p>
        <div className="flex items-center justify-center h-40 text-gray-300 text-sm">
          Aucune donnée disponible
        </div>
      </div>
    )
  }

  // X positions: evenly spaced by index (labels are discrete)
  function xForIndex(i: number): number {
    if (allLabels.length <= 1) return PAD.left
    return PAD.left + (i / (allLabels.length - 1)) * CHART_W
  }

  function yForWatts(w: number): number {
    return PAD.top + CHART_H - ((w - minW) / (maxW - minW)) * CHART_H
  }

  const yTicks = useMemo(() => {
    const range = maxW - minW
    const step = range > 800 ? 200 : range > 400 ? 100 : 50
    const ticks: number[] = []
    let v = Math.ceil(minW / step) * step
    while (v <= maxW) {
      ticks.push(v)
      v += step
    }
    return ticks
  }, [minW, maxW])

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-sm font-semibold text-gray-700">Courbe de puissance</p>
          <p className="text-xs text-gray-400 mt-0.5">Cyclisme · Meilleure puissance par durée</p>
        </div>
      </div>

      {/* Year selector */}
      <div className="flex gap-1 flex-wrap mb-3 mt-2">
        {years.map((y) => {
          const color = getYearColor(y, Array.from(years))
          const active = selectedYears.has(y)
          return (
            <button
              key={y}
              onClick={() => toggleYear(y)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
              style={{
                borderColor: active ? color : '#E5E7EB',
                backgroundColor: active ? color + '18' : 'transparent',
                color: active ? color : '#9CA3AF',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: active ? color : '#D1D5DB' }}
              />
              {y}
            </button>
          )
        })}
      </div>

      {/* SVG Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Y grid lines + labels */}
          {yTicks.map((tick) => {
            const y = yForWatts(tick)
            return (
              <g key={tick}>
                <line
                  x1={PAD.left}
                  y1={y}
                  x2={W - PAD.right}
                  y2={y}
                  stroke="#F3F4F6"
                  strokeWidth="1"
                />
                <text
                  x={PAD.left - 4}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="9"
                  fill="#9CA3AF"
                >
                  {tick}W
                </text>
              </g>
            )
          })}

          {/* X labels */}
          {allLabels.map((label, i) => (
            <text
              key={label}
              x={xForIndex(i)}
              y={H - PAD.bottom + 14}
              textAnchor="middle"
              fontSize="8"
              fill="#9CA3AF"
            >
              {formatDuration(label)}
            </text>
          ))}

          {/* Lines per year */}
          {Array.from(byYear.entries()).map(([year, points]) => {
            const color = getYearColor(year, Array.from(years))
            const pathData = points
              .map((pt, idx) => {
                const li = allLabels.indexOf(pt.distance_label)
                const x = xForIndex(li)
                const y = yForWatts(pt.value)
                return `${idx === 0 ? 'M' : 'L'}${x},${y}`
              })
              .join(' ')

            return (
              <g key={year}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {points.map((pt) => {
                  const li = allLabels.indexOf(pt.distance_label)
                  const x = xForIndex(li)
                  const y = yForWatts(pt.value)
                  return (
                    <circle
                      key={`${year}-${pt.distance_label}`}
                      cx={x}
                      cy={y}
                      r="3"
                      fill={color}
                      stroke="white"
                      strokeWidth="1.5"
                      className="cursor-pointer"
                      onMouseEnter={() =>
                        setTooltip({ x, y, label: pt.distance_label, watts: pt.value, year })
                      }
                    />
                  )
                })}
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
                height={24}
                rx="4"
                fill="#1F2937"
                opacity="0.9"
              />
              <text
                x={Math.min(tooltip.x + 49, W - 49)}
                y={tooltip.y - 12}
                textAnchor="middle"
                fontSize="10"
                fill="white"
              >
                {tooltip.label} · {tooltip.watts}W ({tooltip.year})
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap mt-1">
        {Array.from(selectedYears)
          .sort((a, b) => b - a)
          .map((y) => (
            <div key={y} className="flex items-center gap-1">
              <span
                className="w-3 h-0.5 inline-block rounded"
                style={{ backgroundColor: getYearColor(y, Array.from(years)) }}
              />
              <span className="text-xs text-gray-500">{y}</span>
            </div>
          ))}
      </div>
    </div>
  )
}
