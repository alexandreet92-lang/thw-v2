'use client'

import { useMemo, useState } from 'react'
import type { HRActivity, TrainingZone } from '@/app/(app)/training/page'
import { SPORT_COLORS, SPORT_LABELS } from '@/lib/constants/sports'

interface Props {
  activities: HRActivity[]
  hrMax: number
  zones: TrainingZone[]
}

interface ZoneData {
  label: string
  description: string
  minPct: number
  maxPct: number
  color: string
  hours: number
}

const ZONE_DEFS = [
  { label: 'Z1 — Récupération', description: 'Régénération active, <60% FCmax', minPct: 0, maxPct: 0.6, color: '#06B6D4' },
  { label: 'Z2 — Aérobie', description: 'Endurance fondamentale, 60-70% FCmax', minPct: 0.6, maxPct: 0.7, color: '#22C55E' },
  { label: 'Z3 — Tempo', description: 'Allure soutenue, 70-80% FCmax', minPct: 0.7, maxPct: 0.8, color: '#EAB308' },
  { label: 'Z4 — Seuil', description: 'Près du seuil lactique, 80-90% FCmax', minPct: 0.8, maxPct: 0.9, color: '#F97316' },
  { label: 'Z5 — VO2max', description: 'Effort maximal, >90% FCmax', minPct: 0.9, maxPct: 1.1, color: '#EF4444' },
]

const W = 460
const H = 220
const PAD = { top: 12, right: 16, bottom: 48, left: 48 }
const CHART_W = W - PAD.left - PAD.right
const CHART_H = H - PAD.top - PAD.bottom
const BAR_GAP = 8

export function HRZoneChart({ activities, hrMax, zones: _zones }: Props) {
  const [showInfo, setShowInfo] = useState(false)
  const [hoveredZone, setHoveredZone] = useState<number | null>(null)
  const [sportFilter, setSportFilter] = useState<string>('all')

  const availableSports = useMemo(() => {
    const s = new Set(activities.map((a) => a.sport_type))
    return Array.from(s)
  }, [activities])

  const filtered = useMemo(() => {
    if (sportFilter === 'all') return activities
    return activities.filter((a) => a.sport_type === sportFilter)
  }, [activities, sportFilter])

  const zoneData: ZoneData[] = useMemo(() => {
    const hrMaxVal = hrMax > 0 ? hrMax : 190
    return ZONE_DEFS.map((z) => {
      const minHR = z.minPct * hrMaxVal
      const maxHR = z.maxPct * hrMaxVal
      let totalSec = 0
      for (const a of filtered) {
        if (a.avg_hr >= minHR && a.avg_hr < maxHR) {
          totalSec += a.moving_time_s
        }
      }
      return {
        ...z,
        hours: totalSec / 3600,
      }
    })
  }, [filtered, hrMax])

  const maxHours = Math.max(...zoneData.map((z) => z.hours), 0.1)
  const totalHours = zoneData.reduce((acc, z) => acc + z.hours, 0)

  const barWidth = (CHART_W - BAR_GAP * (ZONE_DEFS.length - 1)) / ZONE_DEFS.length

  function formatH(h: number): string {
    const hh = Math.floor(h)
    const mm = Math.round((h - hh) * 60)
    return `${hh}h${mm.toString().padStart(2, '0')}`
  }

  const yTicks = useMemo(() => {
    const step = maxHours > 200 ? 50 : maxHours > 100 ? 25 : maxHours > 50 ? 10 : maxHours > 20 ? 5 : 1
    const ticks: number[] = []
    for (let v = 0; v <= maxHours * 1.1; v += step) ticks.push(Math.round(v))
    return ticks
  }, [maxHours])

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-sm font-semibold text-gray-700">Durée cumulée par zone FC</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Total : {formatH(totalHours)} · FCmax estimée : {hrMax} bpm
          </p>
        </div>
        <button
          onClick={() => setShowInfo((v) => !v)}
          className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold transition-colors flex-shrink-0"
          title="Infos"
        >
          i
        </button>
      </div>

      {/* Info panel */}
      {showInfo && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3 text-xs text-blue-800 leading-relaxed">
          <p className="font-semibold mb-1">Comment lire ce graphique ?</p>
          <p>
            Ce graphique montre le total d&apos;heures passées dans chaque zone de fréquence cardiaque,
            calculé à partir de la FC moyenne de chaque séance et votre FCmax ({hrMax} bpm).
          </p>
          <p className="mt-1.5">
            <strong>Distribution idéale :</strong> ~80% en Z1-Z2 (endurance fondamentale),
            ~10% en Z3 (tempo), ~10% en Z4-Z5 (intensité). C&apos;est le modèle &ldquo;pyramide inversée&rdquo;
            recommandé pour les sports d&apos;endurance.
          </p>
          <p className="mt-1.5 text-blue-600">
            Les zones sont basées sur % FCmax. Pour plus de précision, renseignez votre LTHR dans
            votre profil.
          </p>
        </div>
      )}

      {/* Sport filter */}
      <div className="flex gap-1 flex-wrap mb-3">
        <button
          onClick={() => setSportFilter('all')}
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
            sportFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Tous
        </button>
        {availableSports.map((s) => (
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

      {/* SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Y grid + labels */}
        {yTicks.map((tick) => {
          const y = PAD.top + CHART_H - (tick / maxHours) * CHART_H
          return (
            <g key={tick}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#F3F4F6" strokeWidth="1" />
              <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#9CA3AF">
                {tick}h
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {zoneData.map((z, i) => {
          const barH = (z.hours / maxHours) * CHART_H
          const x = PAD.left + i * (barWidth + BAR_GAP)
          const y = PAD.top + CHART_H - barH
          const isHovered = hoveredZone === i
          const pct = totalHours > 0 ? ((z.hours / totalHours) * 100).toFixed(0) : '0'

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredZone(i)}
              onMouseLeave={() => setHoveredZone(null)}
              className="cursor-default"
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx="3"
                fill={z.color}
                opacity={isHovered ? 1 : 0.75}
                className="transition-opacity"
              />
              {/* % label on bar */}
              {barH > 20 && (
                <text
                  x={x + barWidth / 2}
                  y={y + Math.min(barH - 4, 16)}
                  textAnchor="middle"
                  fontSize="9"
                  fill="white"
                  fontWeight="600"
                >
                  {pct}%
                </text>
              )}
              {/* Zone label below */}
              <text
                x={x + barWidth / 2}
                y={H - PAD.bottom + 14}
                textAnchor="middle"
                fontSize="9"
                fill={isHovered ? z.color : '#9CA3AF'}
                fontWeight={isHovered ? '600' : '400'}
              >
                Z{i + 1}
              </text>
              <text
                x={x + barWidth / 2}
                y={H - PAD.bottom + 26}
                textAnchor="middle"
                fontSize="8"
                fill="#9CA3AF"
              >
                {formatH(z.hours)}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Hover detail */}
      {hoveredZone !== null && (
        <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
          <span className="font-semibold" style={{ color: zoneData[hoveredZone].color }}>
            {zoneData[hoveredZone].label}
          </span>{' '}
          — {zoneData[hoveredZone].description}
          <span className="ml-2 text-gray-400">
            ({Math.round((zoneData[hoveredZone].minPct * hrMax))}–
            {Math.round((zoneData[hoveredZone].maxPct * hrMax))} bpm)
          </span>
        </div>
      )}
    </div>
  )
}
