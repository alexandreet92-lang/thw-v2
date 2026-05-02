import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Service-role client — bypasses RLS for trusted server-side inserts
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const COACHING_TYPES = ['pack', 'abonnement'] as const
const NIVEAU_SUIVI = ['essentiel', 'standard', 'premium'] as const
const SEXE_VALUES = ['homme', 'femme', 'autre', 'non_precise'] as const

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

  // The website sends English field names — map them to the DB French schema
  const {
    first_name,   // → prenom
    last_name,    // → nom
    email,
    age,
    sexe,
    sport,        // → objectif_sport
    coaching_type,
    coaching_duree,
    coaching_sport,
    coaching_objectif,
    objectif_course,
    objectif_date,
    objectif_temps,
    autres_courses,
    heures_par_semaine,
    contraintes,
    blessures,
    montre_gps,
    capteur_puissance,
    home_trainer,
    salle_muscu,
    strava_connecte,
    option_renfo,
    niveau_suivi,
    infos_complementaires,
  } = body

  if (!first_name || !last_name || !email) {
    return NextResponse.json(
      { error: 'Missing required fields: first_name, last_name, email' },
      { status: 422 }
    )
  }

  const str = (v: unknown) => (v != null && v !== '' ? String(v) : null)
  const bool = (v: unknown) => Boolean(v)

  // Parse age — must be integer between 1 and 119 per DB check constraint
  const ageNum = age != null ? parseInt(String(age), 10) : null
  const safeAge = ageNum != null && ageNum > 0 && ageNum < 120 ? ageNum : null

  // Parse heures_par_semaine — must be non-negative integer
  const heuresNum = heures_par_semaine != null ? parseInt(String(heures_par_semaine), 10) : null
  const safeHeures = heuresNum != null && heuresNum >= 0 ? heuresNum : null

  // Validate enum fields against DB check constraints — set null if invalid
  const safeCoachingType = COACHING_TYPES.includes(coaching_type as typeof COACHING_TYPES[number])
    ? (coaching_type as 'pack' | 'abonnement')
    : null

  const safeNiveauSuivi = NIVEAU_SUIVI.includes(niveau_suivi as typeof NIVEAU_SUIVI[number])
    ? (niveau_suivi as 'essentiel' | 'standard' | 'premium')
    : null

  const safeSexe = SEXE_VALUES.includes(sexe as typeof SEXE_VALUES[number])
    ? (sexe as 'homme' | 'femme' | 'autre' | 'non_precise')
    : null

  // autres_courses — DB expects jsonb array; accept string (split by newline) or array
  const autresCourses: string[] = Array.isArray(autres_courses)
    ? autres_courses.map(String)
    : typeof autres_courses === 'string' && autres_courses.trim()
    ? autres_courses.split('\n').map((s) => s.trim()).filter(Boolean)
    : []

  // ── Insert ───────────────────────────────────────────────────────────────────
  const { data, error } = await supabaseAdmin
    .from('athlete_questionnaires')
    .insert({
      prenom: str(first_name)!,
      nom: str(last_name)!,
      email: str(email)!,
      age: safeAge,
      sexe: safeSexe,
      objectif_sport: str(sport),
      coaching_type: safeCoachingType,
      coaching_duree: str(coaching_duree),
      coaching_sport: str(coaching_sport),
      coaching_objectif: str(coaching_objectif),
      objectif_course: str(objectif_course),
      objectif_date: str(objectif_date),
      objectif_temps: str(objectif_temps),
      autres_courses: autresCourses,
      heures_par_semaine: safeHeures,
      jours_disponibles: [],
      contraintes: str(contraintes),
      blessures: str(blessures),
      montre_gps: bool(montre_gps),
      capteur_puissance: bool(capteur_puissance),
      home_trainer: bool(home_trainer),
      salle_muscu: bool(salle_muscu),
      strava_connecte: bool(strava_connecte),
      option_renfo: bool(option_renfo),
      niveau_suivi: safeNiveauSuivi,
      infos_complementaires: str(infos_complementaires),
      statut: 'nouveau',
    })
    .select('id, created_at')
    .single()

  if (error) {
    console.error('[questionnaire] Supabase insert error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: data.id }, { status: 201 })
}
