'use client'

import { useState } from 'react'

type TargetSport = 'aviron' | 'hyrox' | 'elliptique'

interface ConversionResult {
  targetSport: TargetSport
  estimatedCalories: number
  estimatedTSS: number
  note: string
}

const SPORT_LABELS: Record<TargetSport, string> = {
  aviron: 'Aviron',
  hyrox: 'Hyrox',
  elliptique: 'Elliptique bike',
}

const SPORT_COLORS: Record<TargetSport, string> = {
  aviron: '#06B6D4',
  hyrox: '#EF4444',
  elliptique: '#8B5CF6',
}

const SPORT_DESCRIPTIONS: Record<TargetSport, string> = {
  aviron: 'Travail combiné membres sup./inf., fort impact cardiovasculaire',
  hyrox: 'Combinaison force + endurance, haute intensité métabolique',
  elliptique: 'Cardio basse impact, bon remplacement vélo/course',
}

// Calories per minute estimates for gym → target sport conversion
// Based on MET values and intensity mapping
const CONVERSION_FACTORS: Record<TargetSport, { calPerMin: number; tssPerHour: number; ratio: number }> = {
  aviron: { calPerMin: 9.5, tssPerHour: 65, ratio: 0.85 },
  hyrox: { calPerMin: 10.5, tssPerHour: 75, ratio: 0.9 },
  elliptique: { calPerMin: 7.5, tssPerHour: 50, ratio: 0.7 },
}

function convertSession(
  durationMin: number,
  intensity: 'low' | 'medium' | 'high',
  target: TargetSport
): ConversionResult {
  const intensityMultiplier = intensity === 'low' ? 0.75 : intensity === 'medium' ? 1.0 : 1.25
  const factor = CONVERSION_FACTORS[target]

  const estimatedCalories = Math.round(durationMin * factor.calPerMin * intensityMultiplier)
  const estimatedTSS = Math.round((durationMin / 60) * factor.tssPerHour * intensityMultiplier)

  const intensityLabel = intensity === 'low' ? 'basse' : intensity === 'medium' ? 'modérée' : 'élevée'
  const note = `Conversion basée sur ${durationMin}min de musculation (intensité ${intensityLabel}) → équivalent ${SPORT_LABELS[target]}. TSS estimé : ${estimatedTSS}, ~${estimatedCalories} kcal.`

  return { targetSport: target, estimatedCalories, estimatedTSS, note }
}

export function GymConverter() {
  const [duration, setDuration] = useState<string>('60')
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium')
  const [target, setTarget] = useState<TargetSport>('aviron')
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [converted, setConverted] = useState(false)

  function handleConvert() {
    const mins = parseInt(duration, 10)
    if (!mins || mins <= 0) return
    const res = convertSession(mins, intensity, target)
    setResult(res)
    setConverted(true)
  }

  function handleReset() {
    setResult(null)
    setConverted(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-sm font-semibold text-gray-700 mb-1">Convertir séance musculation</p>
      <p className="text-xs text-gray-400 mb-4">
        Estimez l&apos;équivalent d&apos;une séance de musculation dans un autre sport
      </p>

      {!converted ? (
        <div className="space-y-4">
          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Durée (minutes)</label>
            <input
              type="number"
              min="5"
              max="300"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent"
              placeholder="60"
            />
          </div>

          {/* Intensity */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Intensité de la séance</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((lvl) => {
                const labels = { low: 'Légère', medium: 'Modérée', high: 'Intense' }
                const colors = {
                  low: 'border-green-300 bg-green-50 text-green-700',
                  medium: 'border-yellow-300 bg-yellow-50 text-yellow-700',
                  high: 'border-red-300 bg-red-50 text-red-700',
                }
                const activeColors = {
                  low: 'border-green-500 bg-green-100 text-green-800',
                  medium: 'border-yellow-500 bg-yellow-100 text-yellow-800',
                  high: 'border-red-500 bg-red-100 text-red-800',
                }
                return (
                  <button
                    key={lvl}
                    onClick={() => setIntensity(lvl)}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      intensity === lvl ? activeColors[lvl] : colors[lvl]
                    }`}
                  >
                    {labels[lvl]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Target sport */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Convertir en</label>
            <div className="space-y-2">
              {(Object.keys(SPORT_LABELS) as TargetSport[]).map((s) => {
                const color = SPORT_COLORS[s]
                const isSelected = target === s
                return (
                  <button
                    key={s}
                    onClick={() => setTarget(s)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all"
                    style={{
                      borderColor: isSelected ? color : '#E5E7EB',
                      backgroundColor: isSelected ? color + '12' : 'transparent',
                    }}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{SPORT_LABELS[s]}</p>
                      <p className="text-xs text-gray-400">{SPORT_DESCRIPTIONS[s]}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={handleConvert}
            disabled={!duration || parseInt(duration) <= 0}
            className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm font-semibold transition-colors"
          >
            Calculer l&apos;équivalent
          </button>
        </div>
      ) : result ? (
        <div className="space-y-4">
          {/* Result card */}
          <div
            className="rounded-lg p-4 border"
            style={{
              borderColor: SPORT_COLORS[result.targetSport] + '50',
              backgroundColor: SPORT_COLORS[result.targetSport] + '0A',
            }}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Séance {SPORT_LABELS[result.targetSport]} équivalente
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
                <p className="text-xl font-bold text-gray-900">{result.estimatedTSS}</p>
                <p className="text-xs text-gray-400 mt-0.5">TSS estimé</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
                <p className="text-xl font-bold text-gray-900">{result.estimatedCalories}</p>
                <p className="text-xs text-gray-400 mt-0.5">kcal estimées</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 leading-relaxed">{result.note}</p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
            <p className="text-xs text-amber-700">
              <strong>Note :</strong> Ces valeurs sont des estimations basées sur des équivalences
              métaboliques (MET). La charge réelle dépend de votre poids, condition physique et
              contenu exact de la séance.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Nouvelle conversion
          </button>
        </div>
      ) : null}
    </div>
  )
}
