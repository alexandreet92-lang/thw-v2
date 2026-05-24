'use client'

import dynamic from 'next/dynamic'

const CyclingScreen = dynamic(
  () => import('@/components/record/CyclingScreen').then(m => m.CyclingScreen),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: '#0A0A0A' }}>
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
)

export default function CyclingPage() {
  return <CyclingScreen />
}
