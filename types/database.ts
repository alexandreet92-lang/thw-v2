export type QuestionnaireStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected'

export interface AthleteQuestionnaire {
  id: string
  created_at: string
  // Identité
  first_name: string
  last_name: string
  email: string
  phone: string | null
  age: number | null
  sexe: string | null
  // Sport de base
  sport: string | null
  current_level: string | null
  // Coaching souhaité
  coaching_type: string | null
  coaching_duree: string | null
  coaching_sport: string | null
  coaching_objectif: string | null
  // Objectifs course
  objectif_course: string | null
  objectif_date: string | null
  objectif_temps: string | null
  autres_courses: string | null
  // Entraînement actuel
  heures_par_semaine: string | null
  contraintes: string | null
  blessures: string | null
  goals: string | null
  training_frequency: string | null
  availability: string | null
  // Équipement
  montre_gps: boolean
  capteur_puissance: boolean
  home_trainer: boolean
  salle_muscu: boolean
  strava_connecte: boolean
  // Options
  option_renfo: boolean
  niveau_suivi: string | null
  additional_info: string | null
  infos_complementaires: string | null
  // Gestion
  status: QuestionnaireStatus
}

export interface Database {
  public: {
    Tables: {
      athlete_questionnaires: {
        Row: AthleteQuestionnaire
        Insert: Omit<AthleteQuestionnaire, 'id' | 'created_at'>
        Update: Partial<Omit<AthleteQuestionnaire, 'id' | 'created_at'>>
      }
    }
  }
}
