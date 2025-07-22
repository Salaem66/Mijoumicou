export interface Game {
  id: number;
  nom: string;
  nom_anglais: string;
  description_courte: string;
  description_complete: string;
  joueurs_min: number;
  joueurs_max: number;
  joueurs_ideal: number;
  duree_min: number;
  duree_max: number;
  duree_moyenne: number;
  age_minimum: number;
  complexite: number;
  prix_moyen: number;
  type_principal: string;
  mecaniques: string[];
  themes: string[];
  energie_requise: number;
  niveau_social: number;
  facteur_chance: number;
  tension_niveau: number;
  courbe_apprentissage: number;
  rejouabilite: number;
  niveau_conflit: number;
  tags_mood: string[];
  contextes_adaptes: string[];
  points_forts: string[];
  points_attention: string[];
  conseil_animation?: string;
  similar_to: string[];
  si_vous_aimez: string[];
  compatibility_score?: number;
  match_explanations?: string[];
  compatibility_details?: {
    energy_match: number;
    social_match: number;
    duration_match: boolean;
    player_match: boolean;
    tag_matches: string[];
  };
  inLibrary?: boolean; // Statut de bibliothèque ajouté dynamiquement
}

export interface MoodAnalysis {
  energie_requise: number;
  niveau_social: number;
  facteur_chance: number;
  tension_niveau: number;
  courbe_apprentissage: number;
  rejouabilite: number;
  niveau_conflit: number;
  duree_min: number;
  duree_max: number;
  duree_moyenne: number;
  joueurs_ideal: number;
  complexite: number;
  age_minimum: number;
  detected_moods: string[];
  detected_expressions: string[];
  detected_tags: string[];
  confidence_score: number;
}

export interface RecommendationResponse {
  user_input: string;
  mood_analysis: MoodAnalysis;
  recommendations: Game[];
  global_explanations: string[];
  search_metadata: {
    total_games_analyzed: number;
    games_above_threshold: number;
    analysis_confidence: number;
  };
}

export interface ApiError {
  error: string;
}

// Types d'authentification et de base de données Supabase
export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  complexity_preference?: number;
  duration_preference?: number;
  player_count_preference?: number;
  created_at: string;
  updated_at: string;
}

export interface UserLibraryEntry {
  id: string;
  user_id: string;
  game_id: number;
  added_at: string;
  notes?: string;
  rating?: number;
  // Champs du jeu (depuis la vue)
  nom?: string;
  description_courte?: string;
  complexite?: number;
  duree_moyenne?: number;
  joueurs_min?: number;
  joueurs_max?: number;
}

export interface SearchHistoryEntry {
  id: string;
  user_id: string;
  mood_query: string;
  mood_analysis: MoodAnalysis;
  recommendations: Game[];
  search_date: string;
}