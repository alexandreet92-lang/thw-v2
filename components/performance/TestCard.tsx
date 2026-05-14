'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TestEntry } from './TestsSection'

interface Field {
  key: string
  label: string
  type: 'number' | 'time' | 'text'
  unit?: string
  placeholder?: string
}

interface Props {
  title: string
  description: string
  testType: string
  sport: string
  userId: string
  fields: Field[]
  tests: TestEntry[]
  onAdd: (t: TestEntry) => void
  protocol?: React.ReactNode
}

function formatFieldValue(value: unknown, field: Field): string {
  if (value === null || value === undefined || value === '') return '—'
  if (field.type === 'time') return `${value}`
  if (field.unit) return `${value} ${field.unit}`
  return `${value}`
}

export function TestCard({ title, description, testType, sport, userId, fields, tests, onAdd, protocol }: Props) {
  const [open, setOpen] = useState(false)
  const [showProtocol, setShowProtocol] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [values, setValues] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const result: Record<string, unknown> = {}
    for (const f of fields) {
      const v = values[f.key]
      if (v !== undefined && v !== '') {
        result[f.key] = f.type === 'number' ? parseFloat(v) : v
      }
    }
    const { data, error } = await supabase
      .from('performance_tests')
      .insert({ user_id: userId, test_type: testType, sport, performed_at: date, result, notes: notes || null })
      .select()
      .single()
    setSaving(false)
    if (!error && data) {
      onAdd(data as TestEntry)
      setValues({})
      setNotes('')
      setOpen(false)
    }
  }

  const recentTests = tests.filter((t) => t.test_type === testType).slice(0, 5)

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
            {recentTests[0] && (
              <p className="text-xs text-gray-400 mt-1">
                Dernier : {new Date(recentTests[0].performed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform mt-0.5 ml-4 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          {/* Protocol toggle */}
          {protocol && (
            <div>
              <button
                onClick={() => setShowProtocol((s) => !s)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <svg className={`w-3 h-3 transition-transform ${showProtocol ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                {showProtocol ? 'Masquer' : 'Voir'} le protocole
              </button>
              {showProtocol && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg text-xs text-blue-800 space-y-1">
                  {protocol}
                </div>
              )}
            </div>
          )}

          {/* Input form */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Nouveau résultat</p>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                />
              </div>
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-gray-500 mb-1 block">
                    {f.label}{f.unit ? ` (${f.unit})` : ''}
                  </label>
                  <input
                    type={f.type === 'number' ? 'number' : 'text'}
                    placeholder={f.placeholder}
                    value={values[f.key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Notes (optionnel)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>

          {/* History */}
          {recentTests.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Historique</p>
              <div className="space-y-1.5">
                {recentTests.map((t) => (
                  <div key={t.id} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1.5">
                      {new Date(t.performed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                      {fields.map((f) => {
                        const val = (t.result as Record<string, unknown>)[f.key]
                        if (val === undefined || val === null) return null
                        return (
                          <div key={f.key} className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{f.label}</span>
                            <span className="text-xs font-semibold text-gray-800">{formatFieldValue(val, f)}</span>
                          </div>
                        )
                      })}
                    </div>
                    {t.notes && <p className="text-xs text-gray-400 mt-1.5 italic">{t.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
