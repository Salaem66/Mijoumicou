import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Configuration Supabase avec validation
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Vérification des variables d'environnement
if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL' || !supabaseUrl.startsWith('https://')) {
  console.error('❌ Variable d\'environnement REACT_APP_SUPABASE_URL manquante ou invalide')
  throw new Error('Configuration Supabase incomplète: URL manquante')
}

if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.error('❌ Variable d\'environnement REACT_APP_SUPABASE_ANON_KEY manquante ou invalide')
  throw new Error('Configuration Supabase incomplète: clé anonyme manquante')
}

// Déterminer l'URL de redirection en fonction de l'environnement
const getRedirectUrl = () => {
  // En production (Netlify)
  if (window.location.hostname !== 'localhost') {
    return window.location.origin
  }
  // En développement
  return 'http://localhost:3000'
}

// Créer le client Supabase avec typage TypeScript
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types d'authentification (utiliser any temporairement pour éviter les erreurs de types)
export type User = any // Database['public']['Tables']['user_profiles']['Row']
export type Game = any // Database['public']['Tables']['games']['Row']
export type UserLibrary = any // Database['public']['Tables']['user_libraries']['Row']
export type SearchHistory = any // Database['public']['Tables']['search_history']['Row']
export type UserFavorite = any // Database['public']['Tables']['user_favorites']['Row']

// Service d'authentification
export class AuthService {
  static async signUp(email: string, password: string, metadata?: { username?: string, fullName?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    if (error) throw error
    return data
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  }

  static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectUrl()
      }
    })
    
    if (error) throw error
    return data
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  static async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  // Écouter les changements d'authentification
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Service de profil utilisateur
export class UserProfileService {
  static async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // Ignorer "not found"
    return data
  }

  static async createProfile(userId: string, profile: Partial<User>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        ...profile
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Service des jeux
export class GameService {
  static async getAllGames(): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('nom')
    
    if (error) throw error
    return data || []
  }

  static async getGame(id: number): Promise<Game | null> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  static async searchGames(query: string): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .or(`nom.ilike.%${query}%,description_courte.ilike.%${query}%,tags_mood.cs.{${query}}`)
      .order('nom')
    
    if (error) throw error
    return data || []
  }

  static async getGamesByType(type: string): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('type_principal', type)
      .order('nom')
    
    if (error) throw error
    return data || []
  }
}

// Service de bibliothèque utilisateur
export class LibraryService {
  static async getUserLibrary(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_libraries')
      .select(`
        *,
        games (*)
      `)
      .eq('user_id', userId)
      .order('added_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async addToLibrary(userId: string, gameId: number, notes?: string, rating?: number) {
    try {
      // Vérifier d'abord si le jeu n'est pas déjà dans la bibliothèque
      const isAlreadyInLibrary = await this.isInLibrary(userId, gameId);
      if (isAlreadyInLibrary) {
        throw new Error('Ce jeu est déjà dans votre bibliothèque');
      }

      const { data, error } = await supabase
        .from('user_libraries')
        .insert({
          user_id: userId,
          game_id: gameId,
          notes,
          rating
        })
        .select()
        .single()
      
      if (error) {
        console.error('Erreur addToLibrary:', {
          error,
          userId,
          gameId,
          errorCode: error.code,
          errorMessage: error.message
        });
        
        // Gestion spécifique des erreurs courantes
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Ce jeu est déjà dans votre bibliothèque');
        } else if (error.code === '42501') { // Insufficient privilege
          throw new Error('Permissions insuffisantes pour ajouter ce jeu');
        } else {
          throw new Error(`Erreur lors de l'ajout: ${error.message}`);
        }
      }
      
      return data
    } catch (err: any) {
      console.error('Exception addToLibrary:', err);
      throw err;
    }
  }

  static async removeFromLibrary(userId: string, gameId: number) {
    const { error } = await supabase
      .from('user_libraries')
      .delete()
      .eq('user_id', userId)
      .eq('game_id', gameId)
    
    if (error) throw error
  }

  static async updateLibraryEntry(userId: string, gameId: number, updates: { notes?: string, rating?: number }) {
    const { data, error } = await supabase
      .from('user_libraries')
      .update(updates)
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async isInLibrary(userId: string, gameId: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_libraries')
      .select('id')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return !!data
  }
}

// Service de l'historique de recherche
export class SearchHistoryService {
  static async saveSearch(userId: string, moodQuery: string, moodAnalysis: any, recommendations: any[]) {
    const { data, error } = await supabase
      .from('search_history')
      .insert({
        user_id: userId,
        mood_query: moodQuery,
        mood_analysis: moodAnalysis,
        recommendations: recommendations
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async getUserSearchHistory(userId: string, limit: number = 10): Promise<SearchHistory[]> {
    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', userId)
      .order('search_date', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  }

  static async deleteSearchHistory(userId: string, searchId: string) {
    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('user_id', userId)
      .eq('id', searchId)
    
    if (error) throw error
  }
}

// Service des favoris
export class FavoritesService {
  static async getUserFavorites(userId: string): Promise<Game[]> {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        *,
        games (*)
      `)
      .eq('user_id', userId)
      .order('favorited_at', { ascending: false })
    
    if (error) throw error
    return data?.map(f => f.games).filter(Boolean) || []
  }

  static async addToFavorites(userId: string, gameId: number) {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        game_id: gameId
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async removeFromFavorites(userId: string, gameId: number) {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('game_id', gameId)
    
    if (error) throw error
  }

  static async isFavorite(userId: string, gameId: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return !!data
  }
}