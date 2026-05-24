'use client'

export interface Lap {
  number: number
  duration: number
  distance: number
  avgSpeed: number
  timestamp: number
}

interface Props {
  laps: Lap[]
  currentLapSeconds: number
  currentLapDistance: number
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

function formatDist(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${Math.round(m)} m`
}

export function LapsList({ laps, currentLapSeconds, currentLapDistance }: Props) {
  const currentAvgSpeed = currentLapSeconds > 0
    ? (currentLapDistance / currentLapSeconds) * 3.6
    : 0

  return (
    <div className="w-full px-4 overflow-y-auto max-h-full">
      {/* Current lap */}
      <div className="bg-white/10 rounded-2xl p-3 mb-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Lap actuel</div>
            <div className="text-2xl font-bold text-white">{formatTime(currentLapSeconds)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Distance</div>
            <div className="text-xl font-semibold text-white">{formatDist(currentLapDistance)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Vitesse</div>
            <div className="text-xl font-semibold text-white">{currentAvgSpeed.toFixed(1)}</div>
            <div className="text-xs text-white/40">km/h</div>
          </div>
        </div>
      </div>

      {/* Past laps */}
      {laps.length === 0 ? (
        <p className="text-center text-white/30 text-sm py-4">Aucun lap enregistré</p>
      ) : (
        <div className="space-y-2">
          {[...laps].reverse().map(lap => (
            <div key={lap.number} className="bg-white/5 rounded-xl px-3 py-2 flex justify-between items-center">
              <span className="text-white/50 text-sm w-8">#{lap.number}</span>
              <span className="text-white text-sm font-mono">{formatTime(lap.duration)}</span>
              <span className="text-white/70 text-sm">{formatDist(lap.distance)}</span>
              <span className="text-white/70 text-sm">{lap.avgSpeed.toFixed(1)} km/h</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
