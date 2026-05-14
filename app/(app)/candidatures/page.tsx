import { createClient } from '@/lib/supabase/server'
import type { AthleteQuestionnaire, QuestionnaireStatut } from '@/types/database'
import { CandidatureActions } from './CandidatureActions'

const STATUT_LABELS: Record<QuestionnaireStatut, string> = {
  nouveau:   'Nouveau',
  en_cours:  'En cours',
  accepte:   'Accepté',
  refuse:    'Refusé',
}

const STATUT_STYLES: Record<QuestionnaireStatut, string> = {
  nouveau:  'bg-yellow-100 text-yellow-800',
  en_cours: 'bg-blue-100 text-blue-800',
  accepte:  'bg-green-100 text-green-800',
  refuse:   'bg-red-100 text-red-800',
}

export default async function CandidaturesPage() {
  const supabase = await createClient()

  const { data: candidatures, error } = await supabase
    .from('athlete_questionnaires')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600">Erreur lors du chargement des candidatures.</p>
      </div>
    )
  }

  const pending = candidatures.filter((c) => c.statut === 'nouveau').length

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatures</h1>
          <p className="mt-1 text-sm text-gray-500">
            {candidatures.length} candidature{candidatures.length !== 1 ? 's' : ''} au total
            {pending > 0 && (
              <span className="ml-2 font-medium text-yellow-700">· {pending} nouvelles</span>
            )}
          </p>
        </div>
      </div>

      {candidatures.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">Aucune candidature reçue pour le moment.</p>
          <p className="mt-1 text-sm text-gray-400">
            Les nouvelles candidatures soumises via le site apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Athlète</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Coaching / Objectif</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Reçue le</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {candidatures.map((c: AthleteQuestionnaire) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{c.prenom} {c.nom}</div>
                    <div className="text-sm text-gray-500">{c.email}</div>
                    {c.age && <div className="text-sm text-gray-400">{c.age} ans</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{c.coaching_type ?? '—'}</div>
                    <div className="text-sm text-gray-500">{c.objectif_sport ?? c.coaching_sport ?? '—'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(c.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_STYLES[c.statut]}`}>
                      {STATUT_LABELS[c.statut]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <CandidatureActions id={c.id} currentStatut={c.statut} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
