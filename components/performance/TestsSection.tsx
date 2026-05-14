'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CyclismeTests } from './CyclismeTests'
import { NatationTests } from './NatationTests'
import { HyroxTests } from './HyroxTests'
import { TestHistoryAll } from './TestHistoryAll'

interface Props {
  userId: string
}

export interface TestEntry {
  id: string
  user_id: string
  test_type: string
  sport: string
  performed_at: string
  result: Record<string, unknown>
  notes: string | null
  file_url: string | null
}

type SportTab = 'cyclisme' | 'natation' | 'hyrox' | 'history'

const TABS: { id: SportTab; label: string; color: string }[] = [
  { id: 'cyclisme', label: 'Cyclisme', color: '#3B82F6' },
  { id: 'natation', label: 'Natation', color: '#06B6D4' },
  { id: 'hyrox', label: 'Hyrox', color: '#EF4444' },
  { id: 'history', label: 'Historique', color: '#6B7280' },
]

export function TestsSection({ userId }: Props) {
  const [tab, setTab] = useState<SportTab>('cyclisme')
  const [tests, setTests] = useState<TestEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('performance_tests')
      .select('*')
      .eq('user_id', userId)
      .order('performed_at', { ascending: false })
      .then(({ data }) => {
        setTests((data ?? []) as TestEntry[])
        setLoading(false)
      })
  }, [userId])

  const addTest = (t: TestEntry) => setTests((prev) => [t, ...prev.filter((x) => x.id !== t.id)])

  if (loading) {
    return <div className="text-center py-16 text-gray-400"><p className="text-sm">Chargement…</p></div>
  }

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              tab === t.id ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
            style={tab === t.id ? { backgroundColor: t.color, borderColor: t.color } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'cyclisme' && (
        <CyclismeTests userId={userId} tests={tests.filter((t) => t.sport === 'bike')} onAdd={addTest} />
      )}
      {tab === 'natation' && (
        <NatationTests userId={userId} tests={tests.filter((t) => t.sport === 'swim')} onAdd={addTest} />
      )}
      {tab === 'hyrox' && (
        <HyroxTests userId={userId} tests={tests.filter((t) => t.sport === 'hyrox')} onAdd={addTest} />
      )}
      {tab === 'history' && (
        <TestHistoryAll tests={tests} />
      )}
    </div>
  )
}
