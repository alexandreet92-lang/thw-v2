import { createClient } from '@/lib/supabase/server'
import { PerformanceClient } from '@/components/performance/PerformanceClient'

export const dynamic = 'force-dynamic'

export interface AthleteProfile {
  ftp_watts: number | null
  lthr_bike: number | null
  lthr_run: number | null
  threshold_pace_s_km: number | null
  vma_ms: number | null
  css_s_100m: number | null
  weight_kg: number | null
  height_cm: number | null
  age: number | null
  hr_max: number | null
  hr_rest: number | null
  vo2max: number | null
  rowing_threshold_pace_s_500m: number | null
}

export interface TrainingZoneRow {
  sport: string
  zone_method: string
  ftp_watts: number | null
  lthr: number | null
  vma_ms: number | null
  css_s_100m: number | null
  sl1: string | null
  sl2: string | null
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
  effective_from: string
}

export interface PersonalRecord {
  id: string
  sport: string
  distance_label: string
  performance: string
  performance_unit: string
  achieved_at: string
  year: number | null
  event_type: string | null
  race_name: string | null
  race_location: string | null
  elevation_gain_m: number | null
  terrain_type: string | null
  notes: string | null
}

export interface RaceResultRow {
  id: string
  sport: string
  race_name: string
  race_date: string
  year: number | null
  location: string | null
  distance_label: string
  finish_time: string
  overall_rank: number | null
  overall_total: number | null
  category: string | null
  category_rank: number | null
  split_swim: string | null
  split_bike: string | null
  split_run: string | null
  split_t1: string | null
  split_t2: string | null
  station_times: Record<string, unknown> | null
  notes: string | null
  dnf: boolean
  dns: boolean
}

export interface ActivityVolume {
  sport_type: string
  year: number
  total_hours: number
  sessions: number
  total_distance_km: number
  total_elevation_m: number
}

export interface SportProfileRow {
  id: string
  sport: string
  params: Record<string, unknown>
  category: string | null
  effective_from: string
}

export default async function PerformancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const uid = user.id

  const [
    { data: profileRaw },
    { data: zonesRaw },
    { data: personalRecordsRaw },
    { data: raceResultsRaw },
    { data: activitiesRaw },
    { data: sportProfilesRaw },
  ] = await Promise.all([
    supabase
      .from('athlete_performance_profile')
      .select('ftp_watts,lthr_bike,lthr_run,threshold_pace_s_km,vma_ms,css_s_100m,weight_kg,height_cm,age,hr_max,hr_rest,vo2max,rowing_threshold_pace_s_500m')
      .eq('user_id', uid)
      .order('effective_from', { ascending: false })
      .limit(1),

    supabase
      .from('training_zones')
      .select('sport,zone_method,ftp_watts,lthr,vma_ms,css_s_100m,sl1,sl2,z1_label,z1_value,z2_label,z2_value,z3_label,z3_value,z4_label,z4_value,z5_label,z5_value,effective_from')
      .eq('user_id', uid)
      .eq('is_current', true)
      .order('effective_from', { ascending: false }),

    supabase
      .from('personal_records')
      .select('id,sport,distance_label,performance,performance_unit,achieved_at,year,event_type,race_name,race_location,elevation_gain_m,terrain_type,notes')
      .eq('user_id', uid)
      .order('achieved_at', { ascending: false }),

    supabase
      .from('race_results')
      .select('id,sport,race_name,race_date,year,location,distance_label,finish_time,overall_rank,overall_total,category,category_rank,split_swim,split_bike,split_run,split_t1,split_t2,station_times,notes,dnf,dns')
      .eq('user_id', uid)
      .order('race_date', { ascending: false }),

    supabase
      .from('activities')
      .select('sport_type,started_at,moving_time_s,distance_m,elevation_gain_m,avg_watts,tss')
      .eq('user_id', uid)
      .not('moving_time_s', 'is', null),

    supabase
      .from('sport_profiles')
      .select('id,sport,params,category,effective_from')
      .eq('user_id', uid)
      .eq('is_current', true)
      .order('effective_from', { ascending: false }),
  ])

  // Deduplicate zones — keep most recent per sport
  const zonesByLastSport = new Map<string, TrainingZoneRow>()
  for (const z of (zonesRaw ?? []) as TrainingZoneRow[]) {
    if (!zonesByLastSport.has(z.sport)) zonesByLastSport.set(z.sport, z)
  }
  const zones = Array.from(zonesByLastSport.values())

  // Aggregate activity volumes by year + sport
  const volMap = new Map<string, ActivityVolume>()
  for (const a of activitiesRaw ?? []) {
    const year = new Date(a.started_at as string).getFullYear()
    const key = `${year}-${a.sport_type}`
    const existing = volMap.get(key)
    const hours = (a.moving_time_s as number) / 3600
    const km = ((a.distance_m as number) ?? 0) / 1000
    const elev = (a.elevation_gain_m as number) ?? 0
    if (existing) {
      existing.total_hours += hours
      existing.sessions += 1
      existing.total_distance_km += km
      existing.total_elevation_m += elev
    } else {
      volMap.set(key, {
        sport_type: a.sport_type as string,
        year,
        total_hours: hours,
        sessions: 1,
        total_distance_km: km,
        total_elevation_m: elev,
      })
    }
  }
  const volumes = Array.from(volMap.values())

  // Deduplicate sport_profiles — keep most recent per sport
  const spMap = new Map<string, SportProfileRow>()
  for (const sp of (sportProfilesRaw ?? []) as SportProfileRow[]) {
    if (!spMap.has(sp.sport)) spMap.set(sp.sport, sp)
  }
  const sportProfiles = Array.from(spMap.values())

  return (
    <PerformanceClient
      profile={(profileRaw?.[0] ?? null) as AthleteProfile | null}
      zones={zones}
      personalRecords={(personalRecordsRaw ?? []) as PersonalRecord[]}
      raceResults={(raceResultsRaw ?? []) as RaceResultRow[]}
      volumes={volumes}
      sportProfiles={sportProfiles}
      userId={uid}
    />
  )
}
