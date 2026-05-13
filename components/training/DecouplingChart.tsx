'use client'

import { useMemo, useState } from 'react'
import type { DecouplingPoint } from '@/app/(app)/training/page'
import { SPORT_COLORS, SPORT_LABELS } from '@/lib/constants/sports'

interface Props {
  data: DecouplingPoint[]
}

const W = 460
const H = 220
const PAD = { top: 16, right: 16, bottom: 40, left: 44 }
const CHART_W = W - PAD.left - PAD.right
const CHART_H = H - PAD.top - PAD.bottom

function decouplingColor(v: number): string {
  if (v <= 5) return '#22C55E'
  if (v <= 10) return '#EAB308'
  return '#EF4444'
}

export function DecouplingChart({ data }: Props) {
  const [showInfo, setShowInfo] = useState(false)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: DecouplingPoint } | null>(null)
  const [sportFilter, setSportFilter] = useState<string>('all')

  const sports = useMemo(() => {
    const s = new Set(data.map((d) => d.sport_type))
    return Array.from(s)
  }, [data])

  const filtered = useMemo(() => {
    const base = sportFilter === 'all' ? data : data.filter((d) => d.sport_type === sportFilter)
    return base.filter((d) => d.decoupling !== null && !isNaN(d.decoupling))
  }, [data, sportFilter])

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [filtered]
  )

  const minDate = useMemo(
    () => (sorted.length ? new Date(sorted[0].date).getTime() : Date.now()),
    [sorted]
  )
  const maxDate = useMemo(
    () => (sorted.length ? new Date(sorted[sorted.length - 1].date).getTime() : Date.now() + 1),
    [sorted]
  )

  const allValues = sorted.map((d) => d.decoupling)
  const minVal = Math.min(...allValues, 0)
  const maxVal = Math.max(...allValues, 15) * 1.1

  function xForDate(dateStr: string): number {
    const t = new Date(dateStr).getTime()
    return PAD.left + ((t - minDate) / (maxDate - minDate)) * CHART_W
  }

  function yForVal(v: number): number {
    return PAD.top + CHART_H - ((v - minVal) / (maxVal - minVal)) * CHART_H
  }

  const yTicks = useMemo(() => {
    const step = maxVal > 30 ? 10 : maxVal > 15 ? 5 : 2
    const ticks: number[] = []
    for (let v = 0; v <= maxVal + step; v += step) ticks.push(Math.round(v))
    return ticks
  }, [maxVal])

  // Threshold line at 5%
  const threshold5y = yForVal(5)
  const threshold10y = yForVal(10)

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-700 mb-1">Découplage aérobie</p>
        <p className="text-xs text-gray-400 mb-4">Dérive cardiaque sur les sorties longues</p>
        <div className="flex items-center justify-center h-40 text-gray-300 text-sm">
          Aucune donnée disponible
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-sm font-semibold text-gray-700">Découplage aérobie</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Dérive cardiaque · {sorted.length} séances
          </p>
        </div>
        <button
          onClick={() => setShowInfo((v) => !v)}
          className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold transition-colors flex-shrink-0"
        >
          i
        </button>
      </div>

      {showInfo && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3 text-xs text-blue-800 leading-relaxed">
          <p className="font-semibold mb-1">Qu&apos;est-ce que le découplage aérobie ?</p>
          <p>
            Le découplage mesure la dérive cardiaque sur une sortie longue à intensité constante.
            Il compare le ratio Puissance/FC en première moitié vs seconde moitié.
          </p>
          <div className="mt-1.5 space-y-0.5">
            <p>
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />
              <strong>&lt;5%</strong> — Excellent : bon état de forme aérobie
            </p>
            <p>
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 mr-1" />
              <strong>5–10%</strong> — Acceptable : progression possible
            </p>
            <p>
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />
              <strong>&gt;10%</strong> — Élevé : fatigue ou allure trop haute
            </p>
          </div>
          <p className="mt-1.5 text-blue-600">
            Un découplage en baisse dans le temps = amélioration de l&apos;endurance aérobie.
          </p>
        </div>
      )}

      {/* Sport filter */}
      {sports.length > 1 && (
        <div className="flex gap-1 flex-wrap mb-3">
          <button
            onClick={() => setSportFilter('all')}
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
              sportFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Tous
          </button>
          {sports.map((s) => (
            <button
              key={s}
              onClick={() => setSportFilter(s)}
              className="px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors"
              style={{
                backgroundColor: sportFilter === s ? SPORT_COLORS[s] : '#F3F4F6',
                color: sportFilter === s ? 'white' : '#4B5563',
              }}
            >
              {SPORT_LABELS[s] ?? s}
            </button>
          ))}
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-gray-300 text-sm">
          Aucune donnée pour ce sport
        </div>
      ) : (
        <div className="relative" onMouseLeave={() => setTooltip(null)}>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            {/* Y grid */}
            {yTicks.map((tick) => {
              const y = yForVal(tick)
              return (
                <g key={tick}>
                  <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#F3F4F6" strokeWidth="1" />
                  <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#9CA3AF">
                    {tick}%
                  </text>
                </g>
              )
            })}

            {/* Threshold zones */}
            <rect
              x={PAD.left}
              y={PAD.top}
              width={CHART_W}
              height={threshold10y - PAD.top}
              fill="#FEF2F2"
              opacity="0.5"
            />
            <rect
              x={PAD.left}
              y={threshold10y}
              width={CHART_W}
              height={threshold5y - threshold10y}
              fill="#FEFCE8"
              opacity="0.5"
            />
            <rect
              x={PAD.left}
              y={threshold5y}
              width={CHART_W}
              height={PAD.top + CHART_H - threshold5y}
              fill="#F0FDF4"
              opacity="0.5"
            />

            {/* Threshold lines */}
            <line
              x1={PAD.left}
              y1={threshold5y}
              x2={W - PAD.right}
              y2={threshold5y}
              stroke="#22C55E"
              strokeWidth="1"
              strokeDasharray="4,3"
              opacity="0.6"
            />
            <text x={W - PAD.right - 2} y={threshold5y - 3} textAnchor="end" fontSize="8" fill="#22C55E">
              5%
            </text>
            <line
              x1={PAD.left}
              y1={threshold10y}
              x2={W - PAD.right}
              y2={threshold10y}
              stroke="#EF4444"
              strokeWidth="1"
              strokeDasharray="4,3"
              opacity="0.6"
            />
            <text x={W - PAD.right - 2} y={threshold10y - 3} textAnchor="end" fontSize="8" fill="#EF4444">
              10%
            </text>

            {/* Trend line (simple linear) */}
            {sorted.length >= 3 && (() => {
              const n = sorted.length
              const xs = sorted.map((d) => xForDate(d.date))
              const ys = sorted.map((d) => yForVal(d.decoupling))
              const meanX = xs.reduce((a, b) => a + b, 0) / n
              const meanY = ys.reduce((a, b) => a + b, 0) / n
              const num = xs.reduce((acc, x, i) => acc + (x - meanX) * (ys[i] - meanY), 0)
              const den = xs.reduce((acc, x) => acc + (x - meanX) ** 2, 0)
              const slope = den !== 0 ? num / den : 0
              const intercept = meanY - slope * meanX
              const x1 = xs[0]
              const x2 = xs[n - 1]
              return (
                <line
                  x1={x1}
                  y1={slope * x1 + intercept}
                  x2={x2}
                  y2={slope * x2 + intercept}
                  stroke="#9CA3AF"
                  strokeWidth="1.5"
                  strokeDasharray="6,4"
                  opacity="0.6"
                />
              )
            })()}

            {/* Dots */}
            {sorted.map((pt, i) => {
              const x = xForDate(pt.date)
              const y = yForVal(pt.decoupling)
              const color = decouplingColor(pt.decoupling)
              const sportColor = SPORT_COLORS[pt.sport_type] ?? '#6B7280'
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={sportFilter === 'all' ? color : sportColor}
                  stroke="white"
                  strokeWidth="1.5"
                  className="cursor-pointer"
                  onMouseEnter={() => setTooltip({ x, y, point: pt })}
                />
              )
            })}

            {/* Tooltip */}
            {tooltip && (
              <g>
                <rect
                  x={Math.min(tooltip.x + 8, W - 130)}
                  y={tooltip.y - 38}
                  width={120}
                  height={34}
                  rx="4"
                  fill="#1F2937"
                  opacity="0.92"
                />
                <text
                  x={Math.min(tooltip.x + 68, W - 70)}
                  y={tooltip.y - 22}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="white"
                >
                  {tooltip.point.decoupling.toFixed(1)}% · {tooltip.point.duration_min}min
                </text>
                <text
                  x={Math.min(tooltip.x + 68, W - 70)}
                  y={tooltip.y - 10}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill="#9CA3AF"
                >
                  {new Date(tooltip.point.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                  {tooltip.point.avg_watts ? ` · ${Math.round(tooltip.point.avg_watts)}W` : ''}
                </text>
              </g>
            )}

            {/* X axis labels */}
            {sorted.length > 0 && (() => {
              const firstYear = new Date(sorted[0].date).getFullYear()
              const lastYear = new Date(sorted[sorted.length - 1].date).getFullYear()
              const labels: { year: number; x: number }[] = []
              for (let y = firstYear; y <= lastYear; y++) {
                const x = xForDate(`${y}-06-01`)
                if (x >= PAD.left && x <= W - PAD.right) labels.push({ year: y, x })
              }
              return labels.map(({ year, x }) => (
                <text
                  key={year}
                  x={x}
                  y={H - PAD.bottom + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#9CA3AF"
                >
                  {year}
                </text>
              ))
            })()}
          </svg>
        </div>
      )}

      {/* Stats summary */}
      {sorted.length > 0 && (
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span>
            Moy.{' '}
            <span className="font-semibold text-gray-700">
              {(sorted.reduce((acc, d) => acc + d.decoupling, 0) / sorted.length).toFixed(1)}%
            </span>
          </span>
          <span>
            Min{' '}
            <span className="font-semibold text-green-600">
              {Math.min(...sorted.map((d) => d.decoupling)).toFixed(1)}%
            </span>
          </span>
          <span>
            Max{' '}
            <span className="font-semibold text-red-500">
              {Math.max(...sorted.map((d) => d.decoupling)).toFixed(1)}%
            </span>
          </span>
        </div>
      )}
    </div>
  )
}
