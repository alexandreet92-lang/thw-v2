export type QuestionnaireStatut = 'nouveau' | 'en_cours' | 'accepte' | 'refuse'

export interface AthleteQuestionnaire {
  id: string
  created_at: string
  updated_at: string
  // Identité
  prenom: string
  nom: string
  email: string
  age: number | null
  sexe: 'homme' | 'femme' | 'autre' | 'non_precise' | null
  // Objectifs sport
  objectif_sport: string | null
  objectif_course: string | null
  objectif_date: string | null
  objectif_temps: string | null
  autres_courses: string[]
  // Entraînement
  heures_par_semaine: number | null
  jours_disponibles: string[]
  contraintes: string | null
  blessures: string | null
  // Équipement
  montre_gps: boolean
  capteur_puissance: boolean
  home_trainer: boolean
  salle_muscu: boolean
  strava_connecte: boolean
  // Coaching souhaité
  coaching_type: 'pack' | 'abonnement' | null
  coaching_duree: string | null
  coaching_sport: string | null
  coaching_objectif: string | null
  // Options
  option_renfo: boolean
  niveau_suivi: 'essentiel' | 'standard' | 'premium' | null
  infos_complementaires: string | null
  // Gestion coach
  statut: QuestionnaireStatut
  notes_coach: string | null
}

export interface Database {
  public: {
    Tables: {
      athlete_questionnaires: {
        Row: AthleteQuestionnaire
        Insert: Omit<AthleteQuestionnaire, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<AthleteQuestionnaire, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
