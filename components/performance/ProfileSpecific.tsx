'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { TrainingZoneRow, SportProfileRow } from '@/app/(app)/performance/page'
import { SPORT_COLORS } from '@/lib/constants/sports'

interface Props {
  zones: TrainingZoneRow[]
  sportProfiles: SportProfileRow[]
  userId: string
}

type SportTab = 'running' | 'cyclisme' | 'natation' | 'hyrox'
type HyroxCategory = 'open_f' | 'open_h_pro_f' | 'pro_h'

const HYROX_WEIGHTS: Record<HyroxCategory, {
  farmer: string; lunges: string; sledPush: string; sledPull: string; label: string
}> = {
  open_f:     { farmer: '16 kg', lunges: '10 kg', sledPush: '102 kg', sledPull: '78 kg',  label: 'Open Femme' },
  open_h_pro_f: { farmer: '24 kg', lunges: '20 kg', sledPush: '152 kg', sledPull: '103 kg', label: 'Open Homme / Pro Femme' },
  pro_h:      { farmer: '32 kg', lunges: '30 kg', sledPush: '202 kg', sledPull: '153 kg', label: 'Pro Homme' },
}

function InputField({ label, value, onChange, placeholder, unit }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; unit?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '—'}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        {unit && <span className="text-xs text-gray-400 w-12 shrink-0">{unit}</span>}
      </div>
    </div>
  )
}

export function ProfileSpecific({ zones, sportProfiles, userId }: Props) {
  const [sport, setSport] = useState<SportTab>('cyclisme')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Get existing profile for sport
  const existingProfile = sportProfiles.find((sp) =>
    sp.sport === (sport === 'cyclisme' ? 'bike' : sport === 'running' ? 'run' : sport === 'natation' ? 'swim' : 'hyrox')
  )
  const params = (existingProfile?.params ?? {}) as Record<string, string>

  const bikeZone = zones.find((z) => z.sport === 'bike')
  const runZone = zones.find((z) => z.sport === 'run')

  // Cyclisme state
  const [cyFcEF, setCyFcEF] = useState(params.fc_ef ?? (bikeZone?.z2_value ?? ''))
  const [cyFcSL1, setCyFcSL1] = useState(params.fc_sl1 ?? (bikeZone?.sl1 ?? ''))
  const [cyFcSL2, setCyFcSL2] = useState(params.fc_sl2 ?? (bikeZone?.sl2 ?? ''))
  const [cyWattsEFLow, setCyWattsEFLow] = useState(params.watts_ef_low ?? '')
  const [cyWattsEFHigh, setCyWattsEFHigh] = useState(params.watts_ef_high ?? '')
  const [cyWattsSL1, setCyWattsSL1] = useState(params.watts_sl1 ?? '')
  const [cyWattsSL2, setCyWattsSL2] = useState(params.watts_sl2 ?? '')
  const [cyWattsPMA, setCyWattsPMA] = useState(params.watts_pma ?? '')
  const [cyMaxPower, setCyMaxPower] = useState(params.max_power ?? '')
  const [cyFTP, setCyFTP] = useState(params.ftp ?? (bikeZone?.ftp_watts?.toString() ?? ''))

  // Running state
  const [ruFcEF, setRuFcEF] = useState(params.fc_ef ?? (runZone?.z2_value ?? ''))
  const [ruFcSL1, setRuFcSL1] = useState(params.fc_sl1 ?? (runZone?.sl1 ?? ''))
  const [ruFcSL2, setRuFcSL2] = useState(params.fc_sl2 ?? (runZone?.sl2 ?? ''))
  const [ruAllureEFLow, setRuAllureEFLow] = useState(params.allure_ef_low ?? '')
  const [ruAllureEFHigh, setRuAllureEFHigh] = useState(params.allure_ef_high ?? '')
  const [ruAllureSL1, setRuAllureSL1] = useState(params.allure_sl1 ?? '')
  const [ruAllureSL2, setRuAllureSL2] = useState(params.allure_sl2 ?? '')
  const [ruAllureVMA, setRuAllureVMA] = useState(params.allure_vma ?? '')

  // Natation state
  const [swCSS, setSwCSS] = useState(params.css ?? '')
  const [sw400, setSw400] = useState(params.time_400m ?? '')

  // Hyrox state
  const [hyroxCat, setHyroxCat] = useState<HyroxCategory>((existingProfile?.category as HyroxCategory) ?? 'open_h_pro_f')
  const [hyMaxWallBall, setHyMaxWallBall] = useState(params.max_wall_ball ?? '')
  const [hyRunCompromised, setHyRunCompromised] = useState(params.allure_run_compromised ?? '')
  const [hyMaxFarmerCarry, setHyMaxFarmerCarry] = useState(params.max_farmer_carry ?? '')
  const [hyBBJ, setHyBBJ] = useState(params.time_100m_bbj ?? '')
  const [hyLunges, setHyLunges] = useState(params.time_200m_lunges ?? '')
  const [hySledPush, setHySledPush] = useState(params.time_100m_sled_push ?? '')
  const [hySledPull, setHySledPull] = useState(params.time_100m_sled_pull ?? '')
  const [hySkierg, setHySkierg] = useState(params.time_2000m_skierg ?? '')
  const [hyRow, setHyRow] = useState(params.time_2000m_row ?? '')

  const handleSave = useCallback(async () => {
    setSaving(true)
    const supabase = createClient()

    let sportKey = 'bike'
    let paramsToSave: Record<string, string> = {}
    let categoryToSave: string | null = null

    if (sport === 'cyclisme') {
      sportKey = 'bike'
      paramsToSave = {
        fc_ef: cyFcEF, fc_sl1: cyFcSL1, fc_sl2: cyFcSL2,
        watts_ef_low: cyWattsEFLow, watts_ef_high: cyWattsEFHigh,
        watts_sl1: cyWattsSL1, watts_sl2: cyWattsSL2,
        watts_pma: cyWattsPMA, max_power: cyMaxPower, ftp: cyFTP,
      }
    } else if (sport === 'running') {
      sportKey = 'run'
      paramsToSave = {
        fc_ef: ruFcEF, fc_sl1: ruFcSL1, fc_sl2: ruFcSL2,
        allure_ef_low: ruAllureEFLow, allure_ef_high: ruAllureEFHigh,
        allure_sl1: ruAllureSL1, allure_sl2: ruAllureSL2, allure_vma: ruAllureVMA,
      }
    } else if (sport === 'natation') {
      sportKey = 'swim'
      paramsToSave = { css: swCSS, time_400m: sw400 }
    } else if (sport === 'hyrox') {
      sportKey = 'hyrox'
      categoryToSave = hyroxCat
      paramsToSave = {
        max_wall_ball: hyMaxWallBall, allure_run_compromised: hyRunCompromised,
        max_farmer_carry: hyMaxFarmerCarry, time_100m_bbj: hyBBJ,
        time_200m_lunges: hyLunges, time_100m_sled_push: hySledPush,
        time_100m_sled_pull: hySledPull, time_2000m_skierg: hySkierg,
        time_2000m_row: hyRow,
      }
    }

    // Insert new profile (trigger deactivates old one)
    await supabase.from('sport_profiles').insert({
      user_id: userId,
      sport: sportKey,
      params: paramsToSave,
      category: categoryToSave,
      effective_from: new Date().toISOString().slice(0, 10),
      is_current: true,
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }, [sport, userId, cyFcEF, cyFcSL1, cyFcSL2, cyWattsEFLow, cyWattsEFHigh, cyWattsSL1, cyWattsSL2, cyWattsPMA, cyMaxPower, cyFTP, ruFcEF, ruFcSL1, ruFcSL2, ruAllureEFLow, ruAllureEFHigh, ruAllureSL1, ruAllureSL2, ruAllureVMA, swCSS, sw400, hyroxCat, hyMaxWallBall, hyRunCompromised, hyMaxFarmerCarry, hyBBJ, hyLunges, hySledPush, hySledPull, hySkierg, hyRow])

  const SPORT_TABS: { id: SportTab; label: string; color: string }[] = [
    { id: 'cyclisme', label: 'Cyclisme', color: SPORT_COLORS.bike },
    { id: 'running', label: 'Running', color: SPORT_COLORS.run },
    { id: 'natation', label: 'Natation', color: SPORT_COLORS.swim },
    { id: 'hyrox', label: 'Hyrox', color: SPORT_COLORS.hyrox },
  ]

  const hyroxWeights = HYROX_WEIGHTS[hyroxCat]

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Sport selector */}
      <div className="flex gap-1 p-4 border-b border-gray-50">
        {SPORT_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSport(t.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
            style={{
              borderColor: sport === t.id ? t.color : '#E5E7EB',
              backgroundColor: sport === t.id ? t.color + '15' : 'transparent',
              color: sport === t.id ? t.color : '#6B7280',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4">
        {sport === 'cyclisme' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InputField label="FC EF" value={cyFcEF} onChange={setCyFcEF} placeholder="ex: 130–145 bpm" />
              <InputField label="FC SL1" value={cyFcSL1} onChange={setCyFcSL1} placeholder="ex: 158 bpm" />
              <InputField label="FC SL2" value={cyFcSL2} onChange={setCyFcSL2} placeholder="ex: 172 bpm" />
              <InputField label="Watts EF bas" value={cyWattsEFLow} onChange={setCyWattsEFLow} unit="W" placeholder="ex: 160" />
              <InputField label="Watts EF haut" value={cyWattsEFHigh} onChange={setCyWattsEFHigh} unit="W" placeholder="ex: 210" />
              <InputField label="Watts SL1" value={cyWattsSL1} onChange={setCyWattsSL1} unit="W" placeholder="ex: 220" />
              <InputField label="Watts SL2" value={cyWattsSL2} onChange={setCyWattsSL2} unit="W" placeholder="ex: 265" />
              <InputField label="Watts PMA" value={cyWattsPMA} onChange={setCyWattsPMA} unit="W" placeholder="ex: 350" />
              <InputField label="Max Power" value={cyMaxPower} onChange={setCyMaxPower} unit="W" placeholder="ex: 1100" />
              <InputField label="FTP" value={cyFTP} onChange={setCyFTP} unit="W" placeholder="ex: 285" />
            </div>
          </>
        )}

        {sport === 'running' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InputField label="FC EF" value={ruFcEF} onChange={setRuFcEF} placeholder="ex: 130–145 bpm" />
            <InputField label="FC SL1" value={ruFcSL1} onChange={setRuFcSL1} placeholder="ex: 158 bpm" />
            <InputField label="FC SL2" value={ruFcSL2} onChange={setRuFcSL2} placeholder="ex: 172 bpm" />
            <InputField label="Allure EF basse" value={ruAllureEFLow} onChange={setRuAllureEFLow} placeholder="ex: 5:00/km" />
            <InputField label="Allure EF haute" value={ruAllureEFHigh} onChange={setRuAllureEFHigh} placeholder="ex: 4:30/km" />
            <InputField label="Allure SL1" value={ruAllureSL1} onChange={setRuAllureSL1} placeholder="ex: 4:10/km" />
            <InputField label="Allure SL2" value={ruAllureSL2} onChange={setRuAllureSL2} placeholder="ex: 3:47/km" />
            <InputField label="Allure VMA" value={ruAllureVMA} onChange={setRuAllureVMA} placeholder="ex: 3:20/km" />
          </div>
        )}

        {sport === 'natation' && (
          <div className="grid grid-cols-2 gap-4">
            <InputField label="CSS (allure critique)" value={swCSS} onChange={setSwCSS} placeholder="ex: 1:28/100m" />
            <InputField label="Temps 400m référence" value={sw400} onChange={setSw400} placeholder="ex: 6:00" />
          </div>
        )}

        {sport === 'hyrox' && (
          <>
            {/* Category selector */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Catégorie</label>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(HYROX_WEIGHTS) as HyroxCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setHyroxCat(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      hyroxCat === cat
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {HYROX_WEIGHTS[cat].label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Farmer {hyroxWeights.farmer} · Lunges {hyroxWeights.lunges} · Sled Push {hyroxWeights.sledPush} · Sled Pull {hyroxWeights.sledPull}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InputField label="Max reps Wall Ball" value={hyMaxWallBall} onChange={setHyMaxWallBall} placeholder="ex: 45 reps" />
              <InputField label="Allure Run Compromised" value={hyRunCompromised} onChange={setHyRunCompromised} placeholder="ex: 4:30/km" />
              <InputField label={`Max distance Farmer (${hyroxWeights.farmer})`} value={hyMaxFarmerCarry} onChange={setHyMaxFarmerCarry} placeholder="ex: 300m" />
              <InputField label="Time 100m BBJ" value={hyBBJ} onChange={setHyBBJ} placeholder="ex: 1:45" />
              <InputField label={`Time 200m Lunges (${hyroxWeights.lunges})`} value={hyLunges} onChange={setHyLunges} placeholder="ex: 2:30" />
              <InputField label={`Time 100m Sled Push (${hyroxWeights.sledPush})`} value={hySledPush} onChange={setHySledPush} placeholder="ex: 1:20" />
              <InputField label={`Time 100m Sled Pull (${hyroxWeights.sledPull})`} value={hySledPull} onChange={setHySledPull} placeholder="ex: 1:10" />
              <InputField label="Time 2000m Ski Erg" value={hySkierg} onChange={setHySkierg} placeholder="ex: 7:30" />
              <InputField label="Time 2000m Row" value={hyRow} onChange={setHyRow} placeholder="ex: 7:00" />
            </div>
          </>
        )}

        <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">✓ Profil sauvegardé</span>
          )}
        </div>
      </div>
    </div>
  )
}
