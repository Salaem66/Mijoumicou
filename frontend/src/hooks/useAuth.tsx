import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { AuthService, UserProfileService, User } from '../lib/supabase'

interface AuthContextType {
  user: SupabaseUser | null
  profile: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }

    try {
      let userProfile = await UserProfileService.getProfile(user.id)
      
      if (!userProfile) {
        // Créer le profil s'il n'existe pas
        userProfile = await UserProfileService.createProfile(user.id, {
          username: user.user_metadata?.username || null,
          full_name: user.user_metadata?.fullName || user.user_metadata?.full_name || null,
          complexity_preference: 3,
          duration_preference: 60,
          player_count_preference: 4
        })
      }
      
      setProfile(userProfile)
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      setProfile(null)
    }
  }, [user])

  useEffect(() => {
    // Récupérer la session actuelle
    AuthService.getCurrentSession().then((session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Écouter les changements d'authentification
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Rafraîchir le profil lors de la connexion
          if (session?.user) {
            await refreshProfile()
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [refreshProfile])

  // Charger le profil quand l'utilisateur change (une seule fois)
  useEffect(() => {
    if (user && !loading && !profile) {
      refreshProfile()
    }
  }, [user, loading, profile, refreshProfile])

  const signOut = async () => {
    await AuthService.signOut()
    setProfile(null)
  }

  const value = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}