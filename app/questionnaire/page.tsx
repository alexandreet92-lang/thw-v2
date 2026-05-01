'use client'

import { FormEvent, useState } from 'react'
import emailjs from '@emailjs/browser'

// ── Types ─────────────────────────────────────────────────────────────────────

interface FormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  age: string
  sexe: string
  sport: string
  coaching_type: string
  coaching_duree: string
  coaching_sport: string
  coaching_objectif: string
  objectif_course: string
  objectif_date: string
  objectif_temps: string
  autres_courses: string
  heures_par_semaine: string
  contraintes: string
  blessures: string
  montre_gps: boolean
  capteur_puissance: boolean
  home_trainer: boolean
  salle_muscu: boolean
  strava_connecte: boolean
  option_renfo: boolean
  niveau_suivi: string
  infos_complementaires: string
}

const EMPTY_FORM: FormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  age: '',
  sexe: '',
  sport: '',
  coaching_type: '',
  coaching_duree: '',
  coaching_sport: '',
  coaching_objectif: '',
  objectif_course: '',
  objectif_date: '',
  objectif_temps: '',
  autres_courses: '',
  heures_par_semaine: '',
  contraintes: '',
  blessures: '',
  montre_gps: false,
  capteur_puissance: false,
  home_trainer: false,
  salle_muscu: false,
  strava_connecte: false,
  option_renfo: false,
  niveau_suivi: '',
  infos_complementaires: '',
}

// ── Submission helpers ────────────────────────────────────────────────────────

async function sendToEmailJS(data: FormData) {
  // Variables mappées au template EmailJS configuré (service/template IDs via env)
  return emailjs.send(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
    {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      age: data.age,
      sexe: data.sexe,
      sport: data.sport,
      coaching_type: data.coaching_type,
      coaching_duree: data.coaching_duree,
      coaching_sport: data.coaching_sport,
      coaching_objectif: data.coaching_objectif,
      objectif_course: data.objectif_course,
      objectif_date: data.objectif_date,
      objectif_temps: data.objectif_temps,
      autres_courses: data.autres_courses,
      heures_par_semaine: data.heures_par_semaine,
      contraintes: data.contraintes,
      blessures: data.blessures,
      montre_gps: data.montre_gps ? 'Oui' : 'Non',
      capteur_puissance: data.capteur_puissance ? 'Oui' : 'Non',
      home_trainer: data.home_trainer ? 'Oui' : 'Non',
      salle_muscu: data.salle_muscu ? 'Oui' : 'Non',
      strava_connecte: data.strava_connecte ? 'Oui' : 'Non',
      option_renfo: data.option_renfo ? 'Oui' : 'Non',
      niveau_suivi: data.niveau_suivi,
      infos_complementaires: data.infos_complementaires,
    },
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
  )
}

async function sendToAPI(data: FormData) {
  const response = await fetch('https://thw-appli.vercel.app/api/questionnaire', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer thw_coaching_secret_2026',
    },
    body: JSON.stringify({
      ...data,
      age: data.age ? Number(data.age) : null,
    }),
  })

  if (!response.ok) {
    throw new Error(`API responded with ${response.status}`)
  }

  return response.json()
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuestionnairePage() {
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const set = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const toggle = (field: keyof FormData) => () =>
    setForm((prev) => ({ ...prev, [field]: !prev[field as keyof FormData] }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    // Envoi en parallèle — les deux destinations sont indépendantes
    const [emailResult, apiResult] = await Promise.allSettled([
      sendToEmailJS(form),
      sendToAPI(form),
    ])

    const emailOk = emailResult.status === 'fulfilled'
    const apiOk = apiResult.status === 'rejected' ? false : true

    if (!emailOk) {
      console.error('[EmailJS] error:', (emailResult as PromiseRejectedResult).reason)
    }
    if (!apiOk) {
      console.error('[API] error:', (apiResult as PromiseRejectedResult).reason)
    }

    // Succès si au moins l'une des deux destinations a reçu les données
    if (emailOk || apiOk) {
      setStatus('success')
      setForm(EMPTY_FORM)
    } else {
      setStatus('error')
      setErrorMessage(
        'Une erreur est survenue lors de l'envoi. Merci de réessayer ou de nous contacter directement.'
      )
    }
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Candidature envoyée !</h2>
          <p className="mt-2 text-sm text-gray-500">
            Nous avons bien reçu ta candidature. Notre équipe te contactera dans les plus brefs délais.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-6 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Envoyer une autre candidature
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Candidature coaching</h1>
          <p className="mt-2 text-gray-500">Remplis ce questionnaire pour nous permettre de mieux te connaître.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── Informations personnelles ── */}
          <Section title="Informations personnelles">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Prénom *" required>
                <input type="text" value={form.first_name} onChange={set('first_name')} required className={inputCls} />
              </Field>
              <Field label="Nom *" required>
                <input type="text" value={form.last_name} onChange={set('last_name')} required className={inputCls} />
              </Field>
            </div>
            <Field label="Email *">
              <input type="email" value={form.email} onChange={set('email')} required className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Téléphone">
                <input type="tel" value={form.phone} onChange={set('phone')} className={inputCls} />
              </Field>
              <Field label="Âge">
                <input type="number" min={10} max={99} value={form.age} onChange={set('age')} className={inputCls} />
              </Field>
            </div>
            <Field label="Sexe">
              <select value={form.sexe} onChange={set('sexe')} className={inputCls}>
                <option value="">— Sélectionner —</option>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
                <option value="autre">Autre / Non précisé</option>
              </select>
            </Field>
          </Section>

          {/* ── Type de coaching ── */}
          <Section title="Type de coaching souhaité">
            <Field label="Type de coaching">
              <select value={form.coaching_type} onChange={set('coaching_type')} className={inputCls}>
                <option value="">— Sélectionner —</option>
                <option value="triathlon">Triathlon</option>
                <option value="cyclisme">Cyclisme</option>
                <option value="course_a_pied">Course à pied</option>
                <option value="natation">Natation</option>
                <option value="multi_sports">Multi-sports</option>
                <option value="autre">Autre</option>
              </select>
            </Field>
            <Field label="Durée souhaitée">
              <select value={form.coaching_duree} onChange={set('coaching_duree')} className={inputCls}>
                <option value="">— Sélectionner —</option>
                <option value="1_mois">1 mois</option>
                <option value="3_mois">3 mois</option>
                <option value="6_mois">6 mois</option>
                <option value="1_an">1 an</option>
                <option value="indefini">Sans durée définie</option>
              </select>
            </Field>
            <Field label="Sport principal">
              <input type="text" value={form.coaching_sport} onChange={set('coaching_sport')} className={inputCls} placeholder="Ex : Triathlon M" />
            </Field>
            <Field label="Objectif principal du coaching">
              <textarea value={form.coaching_objectif} onChange={set('coaching_objectif')} rows={3} className={inputCls} placeholder="Décris ce que tu attends du coaching..." />
            </Field>
          </Section>

          {/* ── Objectifs course ── */}
          <Section title="Objectifs course">
            <Field label="Course cible">
              <input type="text" value={form.objectif_course} onChange={set('objectif_course')} className={inputCls} placeholder="Ex : Ironman Nice 2026" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date prévue">
                <input type="date" value={form.objectif_date} onChange={set('objectif_date')} className={inputCls} />
              </Field>
              <Field label="Temps objectif">
                <input type="text" value={form.objectif_temps} onChange={set('objectif_temps')} className={inputCls} placeholder="Ex : sub 10h" />
              </Field>
            </div>
            <Field label="Autres courses prévues">
              <textarea value={form.autres_courses} onChange={set('autres_courses')} rows={2} className={inputCls} placeholder="Liste les autres compétitions de ta saison..." />
            </Field>
          </Section>

          {/* ── Entraînement actuel ── */}
          <Section title="Entraînement actuel">
            <Field label="Sport(s) pratiqué(s)">
              <input type="text" value={form.sport} onChange={set('sport')} className={inputCls} placeholder="Ex : natation, vélo, course" />
            </Field>
            <Field label="Heures d'entraînement par semaine">
              <select value={form.heures_par_semaine} onChange={set('heures_par_semaine')} className={inputCls}>
                <option value="">— Sélectionner —</option>
                <option value="moins_5h">Moins de 5h</option>
                <option value="5_10h">5 à 10h</option>
                <option value="10_15h">10 à 15h</option>
                <option value="15_20h">15 à 20h</option>
                <option value="plus_20h">Plus de 20h</option>
              </select>
            </Field>
            <Field label="Contraintes (travail, famille, voyages…)">
              <textarea value={form.contraintes} onChange={set('contraintes')} rows={2} className={inputCls} placeholder="Horaires, disponibilités, contraintes géographiques..." />
            </Field>
            <Field label="Blessures / historique médical">
              <textarea value={form.blessures} onChange={set('blessures')} rows={2} className={inputCls} placeholder="Blessures passées ou actuelles à mentionner..." />
            </Field>
          </Section>

          {/* ── Équipement ── */}
          <Section title="Équipement disponible">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { field: 'montre_gps', label: 'Montre GPS' },
                { field: 'capteur_puissance', label: 'Capteur de puissance' },
                { field: 'home_trainer', label: 'Home-trainer' },
                { field: 'salle_muscu', label: 'Salle de muscu' },
                { field: 'strava_connecte', label: 'Strava connecté' },
                { field: 'option_renfo', label: 'Option renfo' },
              ].map(({ field, label }) => (
                <label key={field} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 px-3 py-2.5 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={!!form[field as keyof FormData]}
                    onChange={toggle(field as keyof FormData)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </Section>

          {/* ── Suivi & compléments ── */}
          <Section title="Suivi & informations complémentaires">
            <Field label="Niveau de suivi souhaité">
              <select value={form.niveau_suivi} onChange={set('niveau_suivi')} className={inputCls}>
                <option value="">— Sélectionner —</option>
                <option value="basique">Basique (plan seul)</option>
                <option value="standard">Standard (plan + feedback hebdo)</option>
                <option value="premium">Premium (suivi quotidien)</option>
              </select>
            </Field>
            <Field label="Informations complémentaires">
              <textarea value={form.infos_complementaires} onChange={set('infos_complementaires')} rows={4} className={inputCls} placeholder="Tout ce que tu souhaites ajouter..." />
            </Field>
          </Section>

          {/* ── Submit ── */}
          {status === 'error' && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {status === 'submitting' ? 'Envoi en cours…' : 'Envoyer ma candidature'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  )
}
