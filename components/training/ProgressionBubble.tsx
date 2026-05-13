'use client'

import { useMemo, useState } from 'react'
import type { ProgressionPoint, RaceResult } from '@/app/(app)/training/page'

interface Props {
  efData: ProgressionPoint[]
  seuilData: ProgressionPoint[]
  raceResults: RaceResult[]
}

type TabType = 'sessions' | 'races'
type MetricType = 'ef' | 'seuil'

const W = 600
const H = 220
const PAD = { top: 16, right: 16, bottom: 40, left: 48 }
const CHART_W = W - PAD.left - PAD.right
const CHART_H = H - PAD.top - PAD.bottom

const SPORT_LABELS: Record<string, string> = {
  bike: 'Cyclisme',
  virtual_bike: 'Home Trainer',
  run: 'Running',
  swim: 'Natation',
  hyrox: 'Hyrox',
  triathlon: 'Triathlon',
  other: 'Autre',
}

const SPORT_COLORS: Record<string, string> = {
  bike: '#3B82F6',
  virtual_bike: '#60A5FA',
  run: '#F97316',
  swim: '#06B6D4',
  hyrox: '#EF4444',
  triathlon: '#8B5CF6',
  other: '#6B7280',
}

export function ProgressionBubble({ efData, seuilData, raceResults }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('sessions')
  const [metric, setMetric] = useState<MetricType>('ef')
  const [raceSport, setRaceSport] = useState<string>('all')
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: ProgressionPoint } | null>(null)

  const data = metric === 'ef' ? efData : seuilData

  const metricLabel = metric === 'ef'
    ? 'Endurance Fondamentale (FC 140–160 bpm)'
    : 'Zone Seuil (FC 161–178 bpm)'

  const metricDescription = metric === 'ef'
    ? 'Watts moyens sur séances à FC 140–160 bpm. Une augmentation dans le temps = amélioration de votre endurance aérobie.'
    : 'Watts moyens sur séances à FC 161–178 bpm. Reflète l\'amélioration de votre puissance au seuil lactique.'

  const sorted = useMemo(
    () => [...data].sort((a, b) => a.month.localeCompare(b.month)),
    [data]
  )

  const minWatts = useMemo(() => Math.min(...sorted.map((d) => d.avg_watts), 0) * 0.92, [sorted])
  const maxWatts = useMemo(() => Math.max(...sorted.map((d) => d.avg_watts), 1) * 1.08, [sorted])

  function xForMonth(month: string): number {
    if (sorted.length <= 1) return PAD.left + CHART_W / 2
    const idx = sorted.findIndex((d) => d.month === month)
    return PAD.left + (idx / (sorted.length - 1)) * CHART_W
  }

  function yForWatts(w: number): number {
    return PAD.top + CHART_H - ((w - minWatts) / (maxWatts - minWatts)) * CHART_H
  }

  const yTicks = useMemo(() => {
    const range = maxWatts - minWatts
    const step = range > 200 ? 50 : range > 100 ? 25 : 10
    const ticks: number[] = []
    let v = Math.ceil(minWatts / step) * step
    while (v <= maxWatts) { ticks.push(v); v += step }
    return ticks
  }, [minWatts, maxWatts])

  // Trend
  const trendLine = useMemo(() => {
    if (sorted.length < 3) return null
    const n = sorted.length
    const xs = sorted.map((_, i) => i)
    const ys = sorted.map((d) => d.avg_watts)
    const meanX = xs.reduce((a, b) => a + b, 0) / n
    const meanY = ys.reduce((a, b) => a + b, 0) / n
    const num = xs.reduce((acc, x, i) => acc + (x - meanX) * (ys[i] - meanY), 0)
    const den = xs.reduce((acc, x) => acc + (x - meanX) ** 2, 0)
    const slope = den !== 0 ? num / den : 0
    const y0 = meanY - slope * meanX
    const trend = sorted.map((_, i) => y0 + slope * i)
    const improving = slope < 0 // y decreasing = watts increasing? No: yForWatts → lower y = higher watts
    const wattsTrend = slope > 0 ? 'en baisse' : slope < 0 ? 'en hausse' : 'stable'
    return { trend, wattsTrend, improving: slope < 0 }
  }, [sorted])

  // Race comparison
  const raceSports = useMemo(() => {
    const s = new Set(raceResults.map((r) => r.sport))
    return Array.from(s)
  }, [raceResults])

  const filteredRaces = useMemo(() => {
    const base = raceSport === 'all' ? raceResults : raceResults.filter((r) => r.sport === raceSport)
    return [...base].sort((a, b) => new Date(b.race_date).getTime() - new Date(a.race_date).getTime())
  }, [raceResults, raceSport])

  // Group races by sport + distance
  const raceGroups = useMemo(() => {
    const map = new Map<string, RaceResult[]>()
    for (const r of filteredRaces) {
      const key = `${r.sport}-${r.distance_label}`
      const arr = map.get(key) ?? []
      arr.push(r)
      map.set(key, arr)
    }
    // Only show groups with 2+ entries (comparison possible)
    return Array.from(map.entries())
      .filter(([, v]) => v.length >= 1)
      .sort(([a], [b]) => a.localeCompare(b))
  }, [filteredRaces])

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-50">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-semibold text-gray-800">Progression</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Suivez l&apos;évolution de vos performances dans le temps
            </p>
          </div>
          <a
            href="/ai?action=training-analyse"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Analyser avec l&apos;IA
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'sessions' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Séances similaires
          </button>
          <button
            onClick={() => setActiveTab('races')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'races' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Compétitions
          </button>
        </div>
      </div>

      <div className="px-5 py-4">
        {activeTab === 'sessions' && (
          <div>
            {/* Metric selector */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMetric('ef')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  metric === 'ef'
                    ? 'border-blue-400 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                Endurance Fondamentale
              </button>
              <button
                onClick={() => setMetric('seuil')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  metric === 'seuil'
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                Zone Seuil
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4 leading-relaxed">{metricDescription}</p>

            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">Aucune donnée disponible</p>
                <p className="text-xs text-gray-400 mt-1">
                  Les séances avec FC et puissance enregistrées apparaîtront ici
                </p>
              </div>
            ) : (
              <>
                {/* Trend badge */}
                {trendLine && (
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${
                      trendLine.improving
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <svg className={`w-3 h-3 ${trendLine.improving ? '' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Tendance {trendLine.wattsTrend} sur {sorted.length} mois
                  </div>
                )}

                {/* SVG Chart */}
                <div className="relative" onMouseLeave={() => setTooltip(null)}>
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                    {/* Grid */}
                    {yTicks.map((tick) => {
                      const y = yForWatts(tick)
                      return (
                        <g key={tick}>
                          <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#F3F4F6" strokeWidth="1" />
                          <text x={PAD.left - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#9CA3AF">
                            {tick}W
                          </text>
                        </g>
                      )
                    })}

                    {/* Trend line */}
                    {trendLine && sorted.length >= 2 && (() => {
                      const points = sorted.map((d, i) => {
                        const x = xForMonth(d.month)
                        const y = yForWatts(trendLine.trend[i])
                        return `${i === 0 ? 'M' : 'L'}${x},${y}`
                      }).join(' ')
                      return (
                        <path
                          d={points}
                          fill="none"
                          stroke={trendLine.improving ? '#22C55E' : '#F97316'}
                          strokeWidth="1.5"
                          strokeDasharray="6,4"
                          opacity="0.6"
                        />
                      )
                    })()}

                    {/* Line */}
                    {sorted.length >= 2 && (() => {
                      const d = sorted.map((pt, i) => {
                        const x = xForMonth(pt.month)
                        const y = yForWatts(pt.avg_watts)
                        return `${i === 0 ? 'M' : 'L'}${x},${y}`
                      }).join(' ')
                      return (
                        <path
                          d={d}
                          fill="none"
                          stroke={metric === 'ef' ? '#3B82F6' : '#F97316'}
                          strokeWidth="2"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                      )
                    })()}

                    {/* Area */}
                    {sorted.length >= 2 && (() => {
                      const top = sorted.map((pt, i) => {
                        const x = xForMonth(pt.month)
                        const y = yForWatts(pt.avg_watts)
                        return `${i === 0 ? 'M' : 'L'}${x},${y}`
                      }).join(' ')
                      const bottom = `L${xForMonth(sorted[sorted.length - 1].month)},${PAD.top + CHART_H} L${xForMonth(sorted[0].month)},${PAD.top + CHART_H} Z`
                      const color = metric === 'ef' ? '#3B82F6' : '#F97316'
                      return (
                        <path
                          d={`${top} ${bottom}`}
                          fill={color}
                          opacity="0.07"
                        />
                      )
                    })()}

                    {/* Dots */}
                    {sorted.map((pt) => {
                      const x = xForMonth(pt.month)
                      const y = yForWatts(pt.avg_watts)
                      const color = metric === 'ef' ? '#3B82F6' : '#F97316'
                      return (
                        <circle
                          key={pt.month}
                          cx={x}
                          cy={y}
                          r="4"
                          fill={color}
                          stroke="white"
                          strokeWidth="2"
                          className="cursor-pointer"
                          onMouseEnter={() => setTooltip({ x, y, point: pt })}
                        />
                      )
                    })}

                    {/* Tooltip */}
                    {tooltip && (
                      <g>
                        <rect
                          x={Math.min(tooltip.x + 8, W - 120)}
                          y={tooltip.y - 42}
                          width={112}
                          height={38}
                          rx="4"
                          fill="#1F2937"
                          opacity="0.92"
                        />
                        <text
                          x={Math.min(tooltip.x + 64, W - 64)}
                          y={tooltip.y - 26}
                          textAnchor="middle"
                          fontSize="10"
                          fill="white"
                          fontWeight="600"
                        >
                          {tooltip.point.avg_watts}W · FC {tooltip.point.avg_hr} bpm
                        </text>
                        <text
                          x={Math.min(tooltip.x + 64, W - 64)}
                          y={tooltip.y - 12}
                          textAnchor="middle"
                          fontSize="8.5"
                          fill="#9CA3AF"
                        >
                          {tooltip.point.month} · {tooltip.point.sessions} séance{tooltip.point.sessions > 1 ? 's' : ''}
                        </text>
                      </g>
                    )}

                    {/* X axis — year labels */}
                    {(() => {
                      const seen = new Set<string>()
                      return sorted
                        .filter((d) => {
                          const year = d.month.slice(0, 4)
                          if (seen.has(year)) return false
                          seen.add(year)
                          return true
                        })
                        .map((d) => (
                          <text
                            key={d.month}
                            x={xForMonth(d.month)}
                            y={H - PAD.bottom + 14}
                            textAnchor="middle"
                            fontSize="9"
                            fill="#9CA3AF"
                          >
                            {d.month.slice(0, 4)}
                          </text>
                        ))
                    })()}
                  </svg>
                </div>

                <p className="text-xs text-gray-400 mt-1 text-center">{metricLabel}</p>

                {/* Year-over-year comparison */}
                {sorted.length >= 2 && (() => {
                  const byYear = new Map<string, number[]>()
                  for (const d of sorted) {
                    const year = d.month.slice(0, 4)
                    const arr = byYear.get(year) ?? []
                    arr.push(d.avg_watts)
                    byYear.set(year, arr)
                  }
                  const yearAvgs = Array.from(byYear.entries())
                    .map(([year, watts]) => ({
                      year,
                      avg: Math.round(watts.reduce((a, b) => a + b, 0) / watts.length),
                    }))
                    .sort((a, b) => a.year.localeCompare(b.year))

                  if (yearAvgs.length < 2) return null

                  return (
                    <div className="mt-4 pt-3 border-t border-gray-50">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Comparaison annuelle</p>
                      <div className="flex gap-3 flex-wrap">
                        {yearAvgs.map((ya, i) => {
                          const prev = i > 0 ? yearAvgs[i - 1].avg : null
                          const delta = prev !== null ? ya.avg - prev : null
                          return (
                            <div key={ya.year} className="bg-gray-50 rounded-lg px-3 py-2">
                              <p className="text-xs text-gray-400">{ya.year}</p>
                              <p className="text-sm font-bold text-gray-800">{ya.avg}W</p>
                              {delta !== null && (
                                <p className={`text-xs font-medium ${delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                  {delta > 0 ? '+' : ''}{delta}W
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}
              </>
            )}
          </div>
        )}

        {activeTab === 'races' && (
          <div>
            {/* Sport filter */}
            <div className="flex gap-1 flex-wrap mb-4">
              <button
                onClick={() => setRaceSport('all')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  raceSport === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                Tous
              </button>
              {raceSports.map((s) => (
                <button
                  key={s}
                  onClick={() => setRaceSport(s)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: raceSport === s ? SPORT_COLORS[s] : '#F3F4F6',
                    color: raceSport === s ? 'white' : '#4B5563',
                  }}
                >
                  {SPORT_LABELS[s] ?? s}
                </button>
              ))}
            </div>

            {raceGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500">Aucune compétition enregistrée</p>
                <p className="text-xs text-gray-400 mt-1">Ajoutez vos résultats de course pour les comparer</p>
              </div>
            ) : (
              <div className="space-y-4">
                {raceGroups.map(([groupKey, races]) => {
                  const sport = races[0].sport
                  const distLabel = races[0].distance_label
                  const color = SPORT_COLORS[sport] ?? '#6B7280'
                  const sportLabel = SPORT_LABELS[sport] ?? sport

                  return (
                    <div key={groupKey} className="border border-gray-100 rounded-xl overflow-hidden">
                      <div
                        className="px-4 py-2.5 flex items-center gap-2"
                        style={{ backgroundColor: color + '12' }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs font-semibold text-gray-700">
                          {sportLabel} · {distLabel}
                        </span>
                        <span className="ml-auto text-xs text-gray-400">{races.length} course{races.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {races.slice(0, 5).map((race, i) => {
                          const prev = i < races.length - 1 ? races[i + 1] : null
                          const isBest = i === 0

                          return (
                            <div key={race.id} className="px-4 py-2.5 flex items-center gap-3">
                              {isBest && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 font-medium">
                                  Meilleur
                                </span>
                              )}
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-700">{race.race_name}</p>
                                <p className="text-xs text-gray-400">
                                  {new Date(race.race_date).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-800">{race.finish_time}</p>
                                {prev && (
                                  <p className="text-xs text-gray-400">
                                    vs {prev.finish_time}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
