'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  track?: Array<[number, number]>
  className?: string
  zoom?: number
  interactive?: boolean
}

const PULSE_ICON_HTML = `
  <div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center;">
    <div class="gps-halo" style="position:absolute;width:20px;height:20px;border-radius:50%;background:#06B6D4;opacity:0.5;"></div>
    <div style="width:12px;height:12px;border-radius:50%;background:#06B6D4;border:2px solid white;position:relative;z-index:1;"></div>
  </div>
`

const GPS_PULSE_CSS = `
  @keyframes gps-pulse {
    0%   { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(2.5); opacity: 0; }
  }
  .gps-halo { animation: gps-pulse 1.5s ease-out infinite; }
`

export function MapDisplay({ track = [], className = '', zoom = 15, interactive = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const polylineRef = useRef<L.Polyline | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      zoom,
      center: [48.8566, 2.3522],
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map)

    const pulseIcon = L.divIcon({
      className: '',
      html: PULSE_ICON_HTML,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })

    const marker = L.marker([48.8566, 2.3522], { icon: pulseIcon }).addTo(map)
    markerRef.current = marker
    mapRef.current = map

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        map.setView(latlng, zoom)
        marker.setLatLng(latlng)
      },
      () => {},
      { enableHighAccuracy: true, timeout: 5000 }
    )

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
      polylineRef.current = null
    }
  }, [zoom, interactive])

  // Update polyline when track changes
  useEffect(() => {
    if (!mapRef.current) return

    if (polylineRef.current) {
      polylineRef.current.remove()
      polylineRef.current = null
    }

    if (track.length >= 2) {
      polylineRef.current = L.polyline(track, { color: '#06B6D4', weight: 3 }).addTo(mapRef.current)
    }

    if (track.length > 0) {
      const last = track[track.length - 1]
      markerRef.current?.setLatLng(last)
      mapRef.current.setView(last, mapRef.current.getZoom())
    }
  }, [track])

  return (
    <>
      <style>{GPS_PULSE_CSS}</style>
      <div ref={containerRef} className={`w-full h-full ${className}`} />
    </>
  )
}
