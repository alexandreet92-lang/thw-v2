'use client'

import dynamic from 'next/dynamic'
import { type Lap } from './LapsList'

const LapsList = dynamic(() => import('./LapsList').then(m => m.LapsList), { ssr: false })
const MapDisplay = dynamic(() => import('./MapDisplay').then(m => m.MapDisplay), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-white/5 animate-pulse rounded-2xl" />,
})

interface DataCell {
  label: string
  value: string
  unit?: string
  large?: boolean
}

function Cell({ label, value, unit, large }: DataCell) {
  return (
    <div className="bg-white/5 rounded-2xl flex flex-col items-center justify-center p-3 gap-0.5">
      <span className="text-[10px] text-white/40 uppercase tracking-widest">{label}</span>
      <span className={`text-white font-bold leading-none ${large ? 'text-[80px]' : 'text-[32px]'}`}>{value}</span>
      {unit && <span className="text-xs text-white/40">{unit}</span>}
    </div>
  )
}

interface Props {
  page: number
  speedKmh: number
  distanceM: number
  durationFormatted: string
  elevationM: number
  track: Array<[number, number]>
  laps: Lap[]
  currentLapSeconds: number
  currentLapDistance: number
}

function alluteVelo(distM: number, seconds: number): string {
  if (distM < 10 || seconds < 1) return '--:--'
  const secPer100 = (seconds / distM) * 100
  const m = Math.floor(secPer100 / 60)
  const s = Math.round(secPer100 % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function CyclingDataPage({
  page,
  speedKmh,
  distanceM,
  durationFormatted,
  elevationM,
  track,
  laps,
  currentLapSeconds,
  currentLapDistance,
}: Props) {
  const distKm = (distanceM / 1000).toFixed(2)
  const allure = alluteVelo(distanceM, 0)

  if (page === 0) {
    return (
      <div className="flex flex-col h-full gap-2 p-4">
        {/* Speed — big */}
        <div className="flex-[3] bg-white/5 rounded-2xl flex flex-col items-center justify-center">
          <span className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Vitesse</span>
          <span className="text-[80px] font-bold text-white leading-none">{speedKmh.toFixed(1)}</span>
          <span className="text-sm text-white/50">km/h</span>
        </div>

        {/* Row 1 */}
        <div className="flex-[2] grid grid-cols-2 gap-2">
          <Cell label="Distance" value={distKm} unit="km" />
          <Cell label="Durée" value={durationFormatted} />
        </div>

        {/* Row 2 */}
        <div className="flex-[2] grid grid-cols-2 gap-2">
          <Cell label="D+" value={`${Math.round(elevationM)}`} unit="m" />
          <Cell label="Allure" value={allure} unit="/100m" />
        </div>
      </div>
    )
  }

  if (page === 1) {
    return (
      <div className="flex flex-col h-full gap-2 p-4">
        <div className="flex-[3] rounded-2xl overflow-hidden">
          <MapDisplay track={track} className="rounded-2xl" />
        </div>
        <div className="flex-[2] grid grid-cols-2 gap-2">
          <Cell label="Vitesse" value={speedKmh.toFixed(1)} unit="km/h" />
          <Cell label="Distance" value={distKm} unit="km" />
        </div>
      </div>
    )
  }

  // page === 2 — laps
  return (
    <div className="flex flex-col h-full py-4 gap-2">
      <LapsList
        laps={laps}
        currentLapSeconds={currentLapSeconds}
        currentLapDistance={currentLapDistance}
      />
    </div>
  )
}
