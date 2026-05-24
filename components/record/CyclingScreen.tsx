'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useGPSTracking } from '@/hooks/useGPSTracking'
import { useStopwatch } from '@/hooks/useStopwatch'
import { CyclingControls } from './CyclingControls'
import { CyclingDataPage } from './CyclingDataPage'
import { type Lap } from './LapsList'

type Status = 'ready' | 'running' | 'paused'

interface Toast { msg: string; id: number }

export function CyclingScreen() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('ready')
  const [page, setPage] = useState(0)
  const [laps, setLaps] = useState<Lap[]>([])
  const [lapStartSeconds, setLapStartSeconds] = useState(0)
  const [lapStartDistance, setLapStartDistance] = useState(0)
  const [toast, setToast] = useState<Toast | null>(null)
  const startTimeRef = useRef<number>(0)
  const touchStartY = useRef<number | null>(null)

  const isRunning = status === 'running'
  const { seconds, formatted } = useStopwatch(isRunning)
  const { points, currentSpeed, distance, elevationGain, maxSpeed } = useGPSTracking(isRunning)

  const track: Array<[number, number]> = points.map(p => [p.lat, p.lng])
  const currentLapSeconds = seconds - lapStartSeconds
  const currentLapDistance = distance - lapStartDistance

  const showToast = (msg: string) => {
    const id = Date.now()
    setToast({ msg, id })
    setTimeout(() => setToast(t => t?.id === id ? null : t), 2500)
  }

  const handleStart = useCallback(() => {
    startTimeRef.current = Date.now()
    setStatus('running')
  }, [])

  const handlePause = useCallback(() => setStatus('paused'), [])
  const handleResume = useCallback(() => setStatus('running'), [])

  const handleLap = useCallback(() => {
    const lap: Lap = {
      number: laps.length + 1,
      duration: currentLapSeconds,
      distance: currentLapDistance,
      avgSpeed: currentLapSeconds > 0 ? (currentLapDistance / currentLapSeconds) * 3.6 : 0,
      timestamp: Date.now(),
    }
    setLaps(prev => [...prev, lap])
    setLapStartSeconds(seconds)
    setLapStartDistance(distance)
  }, [laps, currentLapSeconds, currentLapDistance, seconds, distance])

  const handleStop = useCallback(async () => {
    setStatus('paused')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('workout_sessions').insert({
          user_id: user.id,
          sport: 'cycling',
          started_at: new Date(startTimeRef.current).toISOString(),
          ended_at: new Date().toISOString(),
          duration_seconds: seconds,
          distance_m: distance,
          elevation_gain_m: elevationGain,
          avg_speed_kmh: seconds > 0 ? (distance / seconds) * 3.6 : 0,
          max_speed_kmh: maxSpeed,
          gps_track: points,
          laps,
          status: 'completed',
        })
      }
      showToast('Séance enregistrée !')
      setTimeout(() => router.push('/record'), 1200)
    } catch {
      showToast('Erreur lors de la sauvegarde')
    }
  }, [seconds, distance, elevationGain, maxSpeed, points, laps, router])

  // Swipe up/down to change page
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return
    const dy = touchStartY.current - e.changedTouches[0].clientY
    if (Math.abs(dy) > 50) {
      setPage(p => Math.max(0, Math.min(2, p + (dy > 0 ? 1 : -1))))
    }
    touchStartY.current = null
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col select-none"
      style={{ background: '#0A0A0A' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 shrink-0">
        <button
          onClick={() => router.push('/record')}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white text-lg"
        >
          ×
        </button>
        <span className="text-sm text-white/60">Vélo</span>
        <button className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-base">
          ⚙
        </button>
      </div>

      {/* Page dots */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        {[0, 1, 2].map(i => (
          <button
            key={i}
            onClick={() => setPage(i)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === page ? 'bg-white' : 'bg-white/30'}`}
          />
        ))}
      </div>

      {/* Data pages */}
      <div className="flex-1 overflow-hidden">
        <CyclingDataPage
          page={page}
          speedKmh={currentSpeed}
          distanceM={distance}
          durationFormatted={formatted}
          elevationM={elevationGain}
          track={track}
          laps={laps}
          currentLapSeconds={currentLapSeconds}
          currentLapDistance={currentLapDistance}
        />
      </div>

      {/* Controls */}
      <div className="shrink-0">
        <CyclingControls
          status={status}
          gpsReady={points.length > 0}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onLap={handleLap}
          onStop={handleStop}
        />
      </div>

      {/* Toast */}
      {toast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur text-white text-sm px-4 py-2 rounded-full">
          {toast.msg}
        </div>
      )}
    </div>
  )
}
