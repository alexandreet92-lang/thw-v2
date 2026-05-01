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
    first_name,
    last_name,
    email,
    phone,
    age,
    sport,
    current_level,
    goals,
    training_frequency,
    availability,
    additional_info,
  } = body

  if (!first_name || !last_name || !email) {
    return NextResponse.json(
      { error: 'Missing required fields: first_name, last_name, email' },
      { status: 422 }
    )
  }

  // ── Insert ───────────────────────────────────────────────────────────────────
  const { data, error } = await supabaseAdmin
    .from('athlete_questionnaires')
    .insert({
      first_name: String(first_name),
      last_name: String(last_name),
      email: String(email),
      phone: phone != null ? String(phone) : null,
      age: age != null ? Number(age) : null,
      sport: sport != null ? String(sport) : null,
      current_level: current_level != null ? String(current_level) : null,
      goals: goals != null ? String(goals) : null,
      training_frequency: training_frequency != null ? String(training_frequency) : null,
      availability: availability != null ? String(availability) : null,
      additional_info: additional_info != null ? String(additional_info) : null,
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
