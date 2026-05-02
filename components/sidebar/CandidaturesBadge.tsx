'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function CandidaturesBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    const fetchPendingCount = async () => {
      const { count: pending } = await supabase
        .from('athlete_questionnaires')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'nouveau')
      setCount(pending ?? 0)
    }

    fetchPendingCount()

    // Réabonnement à chaque INSERT / UPDATE / DELETE sur la table
    const channel = supabase
      .channel('candidatures-badge')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'athlete_questionnaires' },
        () => fetchPendingCount()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (count === 0) return null

  return (
    <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white tabular-nums">
      {count > 99 ? '99+' : count}
    </span>
  )
}
