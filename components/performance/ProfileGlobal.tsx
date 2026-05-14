'use client'

import type { AthleteProfile, TrainingZoneRow } from '@/app/(app)/performance/page'

interface Props {
  profile: AthleteProfile | null
  zones: TrainingZoneRow[]
}

function fmtPace(s: number | null): string {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  const sec = Math.round(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}/km`
}

function fmtPace500(s: number | null): string {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  const sec = Math.round(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}/500m`
}

function fmtVMA(ms: number | null): string {
  if (!ms) return '—'
  return `${(ms * 3.6).toFixed(1)} km/h`
}

function fmtCSS(s: number | null): string {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  const sec = Math.round(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}/100m`
}

const STAT_CARD_CLS = 'bg-white rounded-xl border border-gray-100 shadow-sm p-4'

interface StatRowProps {
  label: string
  value: string
  sub?: string
  color?: string
}

function StatRow({ label, value, sub, color }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="text-right">
        <span
          className="text-sm font-semibold"
          style={{ color: color ?? '#111827' }}
        >
          {value}
        </span>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

export function ProfileGlobal({ profile, zones }: Props) {
  const bikeZone = zones.find((z) => z.sport === 'bike')
  const runZone = zones.find((z) => z.sport === 'run')
  const swimZone = zones.find((z) => z.sport === 'swim')

  if (!profile && zones.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-sm">Aucun profil enregistré.</p>
        <p className="text-xs mt-1">Synchronisez vos activités ou saisissez vos paramètres.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* Anthropométrie */}
      <div className={STAT_CARD_CLS}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Anthropométrie</p>
        <StatRow label="Poids" value={profile?.weight_kg ? `${profile.weight_kg} kg` : '—'} />
        <StatRow label="Taille" value={profile?.height_cm ? `${profile.height_cm} cm` : '—'} />
        <StatRow label="Âge" value={profile?.age ? `${profile.age} ans` : '—'} />
        <StatRow
          label="VO2max"
          value={profile?.vo2max ? `${profile.vo2max.toFixed(1)} ml/kg/min` : '—'}
          color={profile?.vo2max ? (profile.vo2max >= 60 ? '#22C55E' : profile.vo2max >= 50 ? '#EAB308' : '#6B7280') : undefined}
        />
      </div>

      {/* FC */}
      <div className={STAT_CARD_CLS}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Fréquence cardiaque</p>
        <StatRow label="FC max" value={profile?.hr_max ? `${profile.hr_max} bpm` : '—'} color="#EF4444" />
        <StatRow label="FC repos" value={profile?.hr_rest ? `${profile.hr_rest} bpm` : '—'} color="#22C55E" />
        <StatRow label="LTHR Vélo" value={bikeZone?.lthr ? `${bikeZone.lthr} bpm` : (profile?.lthr_bike ? `${profile.lthr_bike} bpm` : '—')} color="#3B82F6" />
        <StatRow label="LTHR Run" value={runZone?.lthr ? `${runZone.lthr} bpm` : (profile?.lthr_run ? `${profile.lthr_run} bpm` : '—')} color="#F97316" />
      </div>

      {/* Cyclisme */}
      <div className={STAT_CARD_CLS}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1.5" />
          Cyclisme
        </p>
        <StatRow label="FTP" value={bikeZone?.ftp_watts ? `${bikeZone.ftp_watts} W` : (profile?.ftp_watts ? `${profile.ftp_watts} W` : '—')} color="#3B82F6" />
        <StatRow label="SL1" value={bikeZone?.sl1 ?? '—'} />
        <StatRow label="SL2" value={bikeZone?.sl2 ?? '—'} />
        <StatRow label="Z1" value={bikeZone?.z1_value ?? '—'} sub={bikeZone?.z1_label} />
        <StatRow label="Z2" value={bikeZone?.z2_value ?? '—'} sub={bikeZone?.z2_label} />
        <StatRow label="Z4 Seuil" value={bikeZone?.z4_value ?? '—'} sub={bikeZone?.z4_label} />
        <StatRow label="Z5 VO2max" value={bikeZone?.z5_value ?? '—'} sub={bikeZone?.z5_label} />
      </div>

      {/* Running */}
      <div className={STAT_CARD_CLS}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-1.5" />
          Running
        </p>
        <StatRow label="VMA" value={fmtVMA(runZone?.vma_ms ?? profile?.vma_ms ?? null)} color="#F97316" />
        <StatRow label="Allure seuil" value={fmtPace(profile?.threshold_pace_s_km ?? null)} />
        <StatRow label="SL1" value={runZone?.sl1 ?? '—'} />
        <StatRow label="SL2" value={runZone?.sl2 ?? '—'} />
        <StatRow label="Z1" value={runZone?.z1_value ?? '—'} sub={runZone?.z1_label} />
        <StatRow label="Z2" value={runZone?.z2_value ?? '—'} sub={runZone?.z2_label} />
        <StatRow label="Z4 Seuil" value={runZone?.z4_value ?? '—'} sub={runZone?.z4_label} />
      </div>

      {/* Natation */}
      <div className={STAT_CARD_CLS}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 mr-1.5" />
          Natation
        </p>
        <StatRow label="CSS" value={fmtCSS(swimZone?.css_s_100m ?? profile?.css_s_100m ?? null)} color="#06B6D4" />
      </div>

      {/* Aviron */}
      <div className={STAT_CARD_CLS}>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          <span className="inline-block w-2 h-2 rounded-full bg-teal-500 mr-1.5" />
          Aviron
        </p>
        <StatRow label="Seuil 500m" value={fmtPace500(profile?.rowing_threshold_pace_s_500m ?? null)} color="#14B8A6" />
      </div>
    </div>
  )
}
