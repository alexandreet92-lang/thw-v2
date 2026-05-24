'use client'

import { useState, useEffect, useRef } from 'react'

export interface GPSPoint {
  lat: number
  lng: number
  altitude: number | null
  timestamp: number
  speed: number | null
}

export function useGPSTracking(isActive: boolean) {
  const [points, setPoints] = useState<GPSPoint[]>([])
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const [distance, setDistance] = useState(0)
  const [elevationGain, setElevationGain] = useState(0)
  const [currentAltitude, setCurrentAltitude] = useState<number | null>(null)
  const [maxSpeed, setMaxSpeed] = useState(0)
  const watchIdRef = useRef<number | null>(null)
  const lastPointRef = useRef<GPSPoint | null>(null)

  useEffect(() => {
    if (!isActive) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      return
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPoint: GPSPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          altitude: pos.coords.altitude,
          timestamp: pos.timestamp,
          speed: pos.coords.speed,
        }

        const speedKmh = pos.coords.speed ? pos.coords.speed * 3.6 : 0
        setCurrentSpeed(speedKmh)
        setMaxSpeed(prev => Math.max(prev, speedKmh))
        setCurrentAltitude(pos.coords.altitude)

        if (lastPointRef.current) {
          const d = haversine(lastPointRef.current, newPoint)
          setDistance(prev => prev + d)

          if (pos.coords.altitude && lastPointRef.current.altitude) {
            const diff = pos.coords.altitude - lastPointRef.current.altitude
            if (diff > 0) setElevationGain(prev => prev + diff)
          }
        }

        lastPointRef.current = newPoint
        setPoints(prev => [...prev, newPoint])
      },
      (err) => console.error('GPS error:', err),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [isActive])

  const reset = () => {
    setPoints([])
    setCurrentSpeed(0)
    setDistance(0)
    setElevationGain(0)
    setCurrentAltitude(null)
    setMaxSpeed(0)
    lastPointRef.current = null
  }

  return { points, currentSpeed, distance, elevationGain, currentAltitude, maxSpeed, reset }
}

function haversine(a: GPSPoint, b: GPSPoint): number {
  const R = 6371000
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}
