import { createClient } from '@/lib/supabase/server'
import { TrainingStats } from '@/components/training/TrainingStats'
import { PowerCurveChart } from '@/components/training/PowerCurveChart'
import { HRZoneChart } from '@/components/training/HRZoneChart'
import { DecouplingChart } from '@/components/training/DecouplingChart'
import { GymConverter } from '@/components/training/GymConverter'
import { ProgressionBubble } from '@/components/training/ProgressionBubble'

export const dynamic = 'force-dynamic'

export interface ActivityStat {
  year: number
  sport_type: string
  total_hours: number
  sessions: number
  avg_watts: number | null
}

export interface PowerCurvePoint {
  distance_label: string
  value: number
  year: number
  achieved_at: string
}

export interface DecouplingPoint {
  date: string
  decoupling: number
  duration_min: number
  avg_watts: number | null
  avg_hr: number | null
  sport_type: string
}

export interface ProgressionPoint {
  month: string
  avg_watts: number
  avg_hr: number
  sessions: number
}

export interface RaceResult {
  id: string
  sport: string
  race_name: string
  race_date: string
  finish_time: string
  distance_label: string
  year: number
}

export interface TrainingZone {
  sport: string
  ftp_watts: number | null
  z1_label: string
  z1_value: string
  z2_label: string
  z2_value: string
  z3_label: string
  z3_value: string
  z4_label: string
  z4_value: string
  z5_label: string
  z5_value: string
}

export interface HRActivity {
  avg_hr: number
  moving_time_s: number
  sport_type: string
}

export default async function TrainingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const uid = user.id

  const [
    { data: statsRaw },
    { data: powerCurveRaw },
    { data: decouplingRaw },
    { data: progressionEF },
    { data: progressionSeuil },
    { data: raceResultsRaw },
    { data: zonesRaw },
    { data: hrActivitiesRaw },
    { data: profileRaw },
  ] = await Promise.all([
    supabase
      .from('activities')
      .select('sport_type, started_at, moving_time_s, avg_watts')
      .eq('user_id', uid)
      .not('moving_time_s', 'is', null),

    supabase
      .from('personal_records')
      .select('sport, distance_label, performance, performance_unit, achieved_at, year')
      .eq('user_id', uid)
      .eq('sport', 'bike')
      .eq('performance_unit', 'watts')
      .order('achieved_at', { ascending: false }),

    supabase
      .from('activities')
      .select('started_at, aerobic_decoupling, cardiac_drift_pct, avg_watts, avg_hr, moving_time_s, sport_type')
      .eq('user_id', uid)
      .in('sport_type', ['bike', 'virtual_bike', 'run'])
      .or('aerobic_decoupling.not.is.null,cardiac_drift_pct.not.is.null')
      .order('started_at', { ascending: true })
      .limit(200),

    supabase
      .from('activities')
      .select('started_at, avg_watts, avg_hr')
      .eq('user_id', uid)
      .in('sport_type', ['bike', 'virtual_bike'])
      .gte('avg_hr', 140)
      .lte('avg_hr', 160)
      .not('avg_watts', 'is', null)
      .not('avg_hr', 'is', null)
      .order('started_at', { ascending: true }),

    supabase
      .from('activities')
      .select('started_at, avg_watts, avg_hr')
      .eq('user_id', uid)
      .in('sport_type', ['bike', 'virtual_bike'])
      .gte('avg_hr', 161)
      .lte('avg_hr', 178)
      .not('avg_watts', 'is', null)
      .not('avg_hr', 'is', null)
      .order('started_at', { ascending: true }),

    supabase
      .from('race_results')
      .select('id, sport, race_name, race_date, finish_time, distance_label, year')
      .eq('user_id', uid)
      .not('finish_time', 'is', null)
      .order('race_date', { ascending: false })
      .limit(50),

    supabase
      .from('training_zones')
      .select('sport, ftp_watts, z1_label, z1_value, z2_label, z2_value, z3_label, z3_value, z4_label, z4_value, z5_label, z5_value')
      .eq('user_id', uid)
      .eq('is_current', true),

    supabase
      .from('activities')
      .select('avg_hr, moving_time_s, sport_type')
      .eq('user_id', uid)
      .not('avg_hr', 'is', null)
      .not('moving_time_s', 'is', null)
      .gte('moving_time_s', 900),

    supabase
      .from('athlete_performance_profile')
      .select('hr_max, weight_kg, ftp_watts')
      .eq('user_id', uid)
      .order('effective_from', { ascending: false })
      .limit(1),
  ])

  // Aggregate activity stats by year + sport
  const statsMap = new Map<string, ActivityStat>()
  for (const row of statsRaw ?? []) {
    const year = new Date(row.started_at as string).getFullYear()
    const key = `${year}-${row.sport_type}`
    const existing = statsMap.get(key)
    const hours = (row.moving_time_s as number) / 3600
    if (existing) {
      existing.total_hours += hours
      existing.sessions += 1
      if (row.avg_watts && existing.avg_watts !== null) {
        existing.avg_watts = (existing.avg_watts * (existing.sessions - 1) + (row.avg_watts as number)) / existing.sessions
      }
    } else {
      statsMap.set(key, {
        year,
        sport_type: row.sport_type as string,
        total_hours: hours,
        sessions: 1,
        avg_watts: row.avg_watts as number | null,
      })
    }
  }
  const activityStats: ActivityStat[] = Array.from(statsMap.values())

  // Best power curve by year (keep highest value per label per year)
  const pcMap = new Map<string, PowerCurvePoint>()
  for (const row of powerCurveRaw ?? []) {
    const year = (row.year as number) ?? new Date(row.achieved_at as string).getFullYear()
    const key = `${year}-${row.distance_label}`
    const val = parseFloat(row.performance as string)
    const existing = pcMap.get(key)
    if (!existing || val > existing.value) {
      pcMap.set(key, {
        distance_label: row.distance_label as string,
        value: val,
        year,
        achieved_at: row.achieved_at as string,
      })
    }
  }
  const powerCurveData: PowerCurvePoint[] = Array.from(pcMap.values())

  const decouplingData: DecouplingPoint[] = (decouplingRaw ?? []).map((r) => ({
    date: r.started_at as string,
    decoupling: (r.aerobic_decoupling ?? r.cardiac_drift_pct) as number,
    duration_min: Math.round((r.moving_time_s as number) / 60),
    avg_watts: r.avg_watts as number | null,
    avg_hr: r.avg_hr as number | null,
    sport_type: r.sport_type as string,
  }))

  // Monthly aggregation for progression
  const efMap = new Map<string, { watts: number[]; hr: number[] }>()
  for (const r of progressionEF ?? []) {
    const month = (r.started_at as string).slice(0, 7)
    const entry = efMap.get(month) ?? { watts: [], hr: [] }
    entry.watts.push(r.avg_watts as number)
    entry.hr.push(r.avg_hr as number)
    efMap.set(month, entry)
  }
  const progressionEFData: ProgressionPoint[] = Array.from(efMap.entries()).map(([month, v]) => ({
    month,
    avg_watts: Math.round(v.watts.reduce((a, b) => a + b, 0) / v.watts.length),
    avg_hr: Math.round(v.hr.reduce((a, b) => a + b, 0) / v.hr.length),
    sessions: v.watts.length,
  }))

  const seuilMap = new Map<string, { watts: number[]; hr: number[] }>()
  for (const r of progressionSeuil ?? []) {
    const month = (r.started_at as string).slice(0, 7)
    const entry = seuilMap.get(month) ?? { watts: [], hr: [] }
    entry.watts.push(r.avg_watts as number)
    entry.hr.push(r.avg_hr as number)
    seuilMap.set(month, entry)
  }
  const progressionSeuilData: ProgressionPoint[] = Array.from(seuilMap.entries()).map(([month, v]) => ({
    month,
    avg_watts: Math.round(v.watts.reduce((a, b) => a + b, 0) / v.watts.length),
    avg_hr: Math.round(v.hr.reduce((a, b) => a + b, 0) / v.hr.length),
    sessions: v.watts.length,
  }))

  const raceResults: RaceResult[] = (raceResultsRaw ?? []).map((r) => ({
    id: r.id as string,
    sport: r.sport as string,
    race_name: r.race_name as string,
    race_date: r.race_date as string,
    finish_time: r.finish_time as string,
    distance_label: r.distance_label as string,
    year: (r.year as number) ?? new Date(r.race_date as string).getFullYear(),
  }))

  const zones: TrainingZone[] = (zonesRaw ?? []) as TrainingZone[]
  const hrActivities: HRActivity[] = (hrActivitiesRaw ?? []) as HRActivity[]
  const hrMax = profileRaw?.[0]?.hr_max as number | null ?? 190

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — pas de bande blanche, intégré dans le fond de la page */}
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Training</h1>
        <p className="text-sm text-gray-500 mt-0.5">Analyse & progression de vos entraînements</p>
      </div>

      <div className="px-6 pb-8 space-y-8">
        {/* SECTION 1 : DONNÉES */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Données</span>
          </div>
          <TrainingStats stats={activityStats} />
        </section>

        {/* SECTION 2 : ANALYSE */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Analyse</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PowerCurveChart data={powerCurveData} />
            <HRZoneChart activities={hrActivities} hrMax={hrMax} zones={zones} />
            <DecouplingChart data={decouplingData} />
            <GymConverter />
          </div>
        </section>

        {/* SECTION 3 : PROGRESSION */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold tracking-widest text-gray-400 uppercase">Progression</span>
          </div>
          <ProgressionBubble
            efData={progressionEFData}
            seuilData={progressionSeuilData}
            raceResults={raceResults}
          />
        </section>
      </div>
    </div>
  )
}
