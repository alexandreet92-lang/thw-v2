'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { QuestionnaireStatus } from '@/types/database'

const NEXT_STATUS: Partial<Record<QuestionnaireStatus, QuestionnaireStatus[]>> = {
  pending: ['reviewed', 'accepted', 'rejected'],
  reviewed: ['accepted', 'rejected'],
}

const ACTION_LABELS: Record<QuestionnaireStatus, string> = {
  pending: 'En attente',
  reviewed: 'Examiner',
  accepted: 'Accepter',
  rejected: 'Refuser',
}

const ACTION_STYLES: Record<QuestionnaireStatus, string> = {
  pending: '',
  reviewed: 'text-blue-600 hover:text-blue-800',
  accepted: 'text-green-600 hover:text-green-800',
  rejected: 'text-red-600 hover:text-red-800',
}

interface Props {
  id: string
  currentStatus: QuestionnaireStatus
}

export function CandidatureActions({ id, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const nextStatuses = NEXT_STATUS[currentStatus] ?? []

  if (nextStatuses.length === 0) return <span className="text-xs text-gray-400">—</span>

  const handleUpdate = async (status: QuestionnaireStatus) => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('athlete_questionnaires').update({ status }).eq('id', id)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center justify-end gap-3">
      {nextStatuses.map((status) => (
        <button
          key={status}
          onClick={() => handleUpdate(status)}
          disabled={loading}
          className={`text-sm font-medium transition-colors disabled:opacity-50 ${ACTION_STYLES[status]}`}
        >
          {ACTION_LABELS[status]}
        </button>
      ))}
    </div>
  )
}
