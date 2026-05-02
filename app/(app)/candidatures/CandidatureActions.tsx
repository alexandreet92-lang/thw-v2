'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { QuestionnaireStatut } from '@/types/database'

const NEXT_STATUT: Partial<Record<QuestionnaireStatut, QuestionnaireStatut[]>> = {
  nouveau:  ['en_cours', 'accepte', 'refuse'],
  en_cours: ['accepte', 'refuse'],
}

const ACTION_LABELS: Record<QuestionnaireStatut, string> = {
  nouveau:  'Nouveau',
  en_cours: 'Prendre en charge',
  accepte:  'Accepter',
  refuse:   'Refuser',
}

const ACTION_STYLES: Record<QuestionnaireStatut, string> = {
  nouveau:  '',
  en_cours: 'text-blue-600 hover:text-blue-800',
  accepte:  'text-green-600 hover:text-green-800',
  refuse:   'text-red-600 hover:text-red-800',
}

interface Props {
  id: string
  currentStatut: QuestionnaireStatut
}

export function CandidatureActions({ id, currentStatut }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const nextStatuts = NEXT_STATUT[currentStatut] ?? []

  if (nextStatuts.length === 0) return <span className="text-xs text-gray-400">—</span>

  const handleUpdate = async (statut: QuestionnaireStatut) => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('athlete_questionnaires').update({ statut }).eq('id', id)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center justify-end gap-3">
      {nextStatuts.map((statut) => (
        <button
          key={statut}
          onClick={() => handleUpdate(statut)}
          disabled={loading}
          className={`text-sm font-medium transition-colors disabled:opacity-50 ${ACTION_STYLES[statut]}`}
        >
          {ACTION_LABELS[statut]}
        </button>
      ))}
    </div>
  )
}
