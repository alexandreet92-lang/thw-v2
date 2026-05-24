'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SportSelector } from '@/components/record/SportSelector'

const MapDisplay = dynamic(() => import('@/components/record/MapDisplay').then(m => m.MapDisplay), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" />,
})

interface Toast { msg: string; id: number }

export default function RecordPage() {
  const router = useRouter()
  const [showSports, setShowSports] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = (msg: string) => {
    const id = Date.now()
    setToast({ msg, id })
    setTimeout(() => setToast(t => t?.id === id ? null : t), 2500)
  }

  const handleSelectSport = (sportId: string) => {
    setShowSports(false)
    if (sportId === 'cycling') {
      router.push('/record/cycling')
    }
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Map — 60% */}
      <div style={{ flex: '6' }} className="relative min-h-0">
        <MapDisplay className="w-full h-full" />
      </div>

      {/* Bottom panel — 40% */}
      <div
        style={{ flex: '4' }}
        className="bg-background border-t border-border rounded-t-3xl px-5 pt-5 pb-8 flex flex-col gap-3 min-h-0"
      >
        <p className="text-lg font-semibold text-center">Enregistrer</p>

        {/* Démarrer */}
        <button
          onClick={() => setShowSports(true)}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-base transition-opacity active:opacity-80"
        >
          Démarrer une activité
        </button>

        {/* Créer un parcours */}
        <button
          onClick={() => showToast('Fonctionnalité à venir')}
          className="w-full h-14 rounded-2xl bg-muted border border-border text-foreground font-medium text-base transition-opacity active:opacity-80"
        >
          Créer un parcours
        </button>
      </div>

      {/* Sport selector */}
      <SportSelector
        open={showSports}
        onClose={() => setShowSports(false)}
        onSelect={handleSelectSport}
        onToast={showToast}
      />

      {/* Toast */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-sm px-4 py-2 rounded-full z-50 whitespace-nowrap">
          {toast.msg}
        </div>
      )}
    </div>
  )
}
