export type QuestionnaireStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected'

export interface AthleteQuestionnaire {
  id: string
  created_at: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  age: number | null
  sport: string | null
  current_level: string | null
  goals: string | null
  training_frequency: string | null
  availability: string | null
  additional_info: string | null
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
