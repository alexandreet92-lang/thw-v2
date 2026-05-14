'use client'

import type { TestEntry } from './TestsSection'

interface Props {
  tests: TestEntry[]
}

const TEST_LABELS: Record<string, string> = {
  endurance_4h: 'Endurance 4h (Vélo)',
  progressive_ef: 'EF Progressif (Vélo)',
  endurance_ftp: 'Endurance + FTP (Vélo)',
  hypoxie_crawl: 'Hypoxie Crawl (Natation)',
  css_swim: 'CSS (Natation)',
  pft: 'PFT (Hyrox)',
  bbj: 'BBJ (Hyrox)',
  farmer_carry_max: 'Farmer Carry Max (Hyrox)',
  wall_ball_1min: 'Wall Ball 1min (Hyrox)',
  wall_ball_5min: 'Wall Ball 5min (Hyrox)',
  run_compromised: 'Run Compromised (Hyrox)',
}

const SPORT_COLORS: Record<string, string> = {
  bike: '#3B82F6',
  swim: '#06B6D4',
  hyrox: '#EF4444',
}

export function TestHistoryAll({ tests }: Props) {
  if (tests.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">Aucun test enregistré.</p>
        <p className="text-xs mt-1">Allez dans Cyclisme, Natation ou Hyrox pour saisir vos premiers résultats.</p>
      </div>
    )
  }

  // Group by month
  const byMonth = new Map<string, TestEntry[]>()
  for (const t of tests) {
    const d = new Date(t.performed_at)
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
    if (!byMonth.has(key)) byMonth.set(key, [])
    byMonth.get(key)!.push(t)
  }

  const sortedMonths = Array.from(byMonth.keys()).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <p className="text-sm font-semibold text-gray-800 mb-1">Tous les tests</p>
        <p className="text-xs text-gray-400">{tests.length} test{tests.length > 1 ? 's' : ''} enregistré{tests.length > 1 ? 's' : ''}</p>
      </div>

      {sortedMonths.map((monthKey) => {
        const [year, month] = monthKey.split('-')
        const monthTests = byMonth.get(monthKey)!
        const monthLabel = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('fr-FR', {
          month: 'long', year: 'numeric'
        })

        return (
          <div key={monthKey}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">{monthLabel}</p>
            <div className="space-y-2">
              {monthTests.map((t) => {
                const color = SPORT_COLORS[t.sport] ?? '#6B7280'
                const resultEntries = Object.entries(t.result as Record<string, unknown>).slice(0, 3)
                return (
                  <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {TEST_LABELS[t.test_type] ?? t.test_type}
                          </p>
                          <p className="text-xs text-gray-400 flex-shrink-0">
                            {new Date(t.performed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                        {resultEntries.length > 0 && (
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                            {resultEntries.map(([k, v]) => (
                              <span key={k} className="text-xs text-gray-500">
                                <span className="text-gray-400">{k.replace(/_/g, ' ')}: </span>
                                <span className="font-medium text-gray-700">{`${v}`}</span>
                              </span>
                            ))}
                          </div>
                        )}
                        {t.notes && (
                          <p className="text-xs text-gray-400 italic mt-0.5 truncate">{t.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
