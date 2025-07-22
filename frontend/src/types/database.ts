export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: number
          nom: string
          nom_anglais: string | null
          description_courte: string | null
          description_complete: string | null
          joueurs_min: number
          joueurs_max: number
          joueurs_ideal: number | null
          duree_min: number | null
          duree_max: number | null
          duree_moyenne: number
          age_minimum: number | null
          complexite: number | null
          prix_moyen: number | null
          type_principal: string | null
          mecaniques: string[] | null
          themes: string[] | null
          energie_requise: number | null
          niveau_social: number | null
          facteur_chance: number | null
          tension_niveau: number | null
          courbe_apprentissage: number | null
          rejouabilite: number | null
          niveau_conflit: number | null
          tags_mood: string[] | null
          contextes_adaptes: string[] | null
          points_forts: string[] | null
          points_faibles: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nom: string
          nom_anglais?: string | null
          description_courte?: string | null
          description_complete?: string | null
          joueurs_min: number
          joueurs_max: number
          joueurs_ideal?: number | null
          duree_min?: number | null
          duree_max?: number | null
          duree_moyenne?: number
          age_minimum?: number | null
          complexite?: number | null
          prix_moyen?: number | null
          type_principal?: string | null
          mecaniques?: string[] | null
          themes?: string[] | null
          energie_requise?: number | null
          niveau_social?: number | null
          facteur_chance?: number | null
          tension_niveau?: number | null
          courbe_apprentissage?: number | null
          rejouabilite?: number | null
          niveau_conflit?: number | null
          tags_mood?: string[] | null
          contextes_adaptes?: string[] | null
          points_forts?: string[] | null
          points_faibles?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nom?: string
          nom_anglais?: string | null
          description_courte?: string | null
          description_complete?: string | null
          joueurs_min?: number
          joueurs_max?: number
          joueurs_ideal?: number | null
          duree_min?: number | null
          duree_max?: number | null
          duree_moyenne?: number
          age_minimum?: number | null
          complexite?: number | null
          prix_moyen?: number | null
          type_principal?: string | null
          mecaniques?: string[] | null
          themes?: string[] | null
          energie_requise?: number | null
          niveau_social?: number | null
          facteur_chance?: number | null
          tension_niveau?: number | null
          courbe_apprentissage?: number | null
          rejouabilite?: number | null
          niveau_conflit?: number | null
          tags_mood?: string[] | null
          contextes_adaptes?: string[] | null
          points_forts?: string[] | null
          points_faibles?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          complexity_preference: number | null
          duration_preference: number | null
          player_count_preference: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          complexity_preference?: number | null
          duration_preference?: number | null
          player_count_preference?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          complexity_preference?: number | null
          duration_preference?: number | null
          player_count_preference?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_libraries: {
        Row: {
          id: string
          user_id: string | null
          game_id: number | null
          added_at: string
          notes: string | null
          rating: number | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          game_id?: number | null
          added_at?: string
          notes?: string | null
          rating?: number | null
        }
        Update: {
          id?: string
          user_id?: string | null
          game_id?: number | null
          added_at?: string
          notes?: string | null
          rating?: number | null
        }
      }
      search_history: {
        Row: {
          id: string
          user_id: string | null
          mood_query: string
          mood_analysis: Json | null
          recommendations: Json | null
          search_date: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          mood_query: string
          mood_analysis?: Json | null
          recommendations?: Json | null
          search_date?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          mood_query?: string
          mood_analysis?: Json | null
          recommendations?: Json | null
          search_date?: string
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string | null
          game_id: number | null
          favorited_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          game_id?: number | null
          favorited_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          game_id?: number | null
          favorited_at?: string
        }
      }
    }
    Views: {
      user_library_with_games: {
        Row: {
          id: string | null
          user_id: string | null
          game_id: number | null
          added_at: string | null
          notes: string | null
          rating: number | null
          nom: string | null
          description_courte: string | null
          complexite: number | null
          duree_moyenne: number | null
          joueurs_min: number | null
          joueurs_max: number | null
        }
      }
      popular_games: {
        Row: {
          id: number | null
          nom: string | null
          library_count: number | null
          favorite_count: number | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}