import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Service-role client — bypasses RLS for trusted server-side inserts
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  // ── Auth guard ──────────────────────────────────────────────────────────────
  const apiKey = process.env.QUESTIONNAIRE_API_KEY
  const authHeader = request.headers.get('Authorization')

  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse body ───────────────────────────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    // Identité
    first_name,
    last_name,
    email,
    phone,
    age,
    sexe,
    // Sport de base
    sport,
    current_level,
    // Coaching souhaité
    coaching_type,
    coaching_duree,
    coaching_sport,
    coaching_objectif,
    // Objectifs course
    objectif_course,
    objectif_date,
    objectif_temps,
    autres_courses,
    // Entraînement actuel
    heures_par_semaine,
    contraintes,
    blessures,
    goals,
    training_frequency,
    availability,
    // Équipement (booléens)
    montre_gps,
    capteur_puissance,
    home_trainer,
    salle_muscu,
    strava_connecte,
    // Options
    option_renfo,
    niveau_suivi,
    additional_info,
    infos_complementaires,
  } = body

  if (!first_name || !last_name || !email) {
    return NextResponse.json(
      { error: 'Missing required fields: first_name, last_name, email' },
      { status: 422 }
    )
  }

  const str = (v: unknown) => (v != null ? String(v) : null)
  const bool = (v: unknown) => Boolean(v)
  const num = (v: unknown) => (v != null ? Number(v) : null)

  // ── Insert ───────────────────────────────────────────────────────────────────
  const { data, error } = await supabaseAdmin
    .from('athlete_questionnaires')
    .insert({
      first_name: str(first_name)!,
      last_name: str(last_name)!,
      email: str(email)!,
      phone: str(phone),
      age: num(age),
      sexe: str(sexe),
      sport: str(sport),
      current_level: str(current_level),
      coaching_type: str(coaching_type),
      coaching_duree: str(coaching_duree),
      coaching_sport: str(coaching_sport),
      coaching_objectif: str(coaching_objectif),
      objectif_course: str(objectif_course),
      objectif_date: str(objectif_date),
      objectif_temps: str(objectif_temps),
      autres_courses: str(autres_courses),
      heures_par_semaine: str(heures_par_semaine),
      contraintes: str(contraintes),
      blessures: str(blessures),
      goals: str(goals),
      training_frequency: str(training_frequency),
      availability: str(availability),
      montre_gps: bool(montre_gps),
      capteur_puissance: bool(capteur_puissance),
      home_trainer: bool(home_trainer),
      salle_muscu: bool(salle_muscu),
      strava_connecte: bool(strava_connecte),
      option_renfo: bool(option_renfo),
      niveau_suivi: str(niveau_suivi),
      additional_info: str(additional_info),
      infos_complementaires: str(infos_complementaires),
      status: 'pending',
    })
    .select('id, created_at')
    .single()

  if (error) {
    console.error('[questionnaire] Supabase insert error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id }, { status: 201 })
}
