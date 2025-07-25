import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'
import { AuthService } from '../../lib/supabase'

interface AuthFormProps {
  mode: 'login' | 'register'
  onSuccess: () => void
  onToggleMode: () => void
}

export function AuthForm({ mode, onSuccess, onToggleMode }: AuthFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas')
        }
        
        await AuthService.signUp(
          formData.email,
          formData.password,
          {
            username: formData.username,
            fullName: formData.fullName
          }
        )
        
        setError('Vérifiez votre email pour confirmer votre inscription !')
      } else {
        await AuthService.signIn(formData.email, formData.password)
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      await AuthService.signInWithGoogle()
      // La redirection se fera automatiquement
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion avec Google')
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">
          {mode === 'login' ? 'Connexion' : 'Inscription'}
        </h2>
        <p className="text-gray-600 mt-2">
          {mode === 'login' 
            ? 'Connectez-vous pour accéder à votre bibliothèque de jeux'
            : 'Créez votre compte pour sauvegarder vos jeux préférés'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <>
            <div>
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange('fullName')}
                placeholder="Votre nom complet"
              />
            </div>
            <div>
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={handleChange('username')}
                placeholder="Nom d'utilisateur unique"
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange('email')}
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange('password')}
            placeholder="Votre mot de passe"
            minLength={6}
          />
        </div>

        {mode === 'register' && (
          <div>
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              placeholder="Confirmez votre mot de passe"
              minLength={6}
            />
          </div>
        )}

        {error && (
          <div className={`text-sm p-3 rounded-md ${
            error.includes('Vérifiez') 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Chargement...' : (mode === 'login' ? 'Se connecter' : 'S\'inscrire')}
        </Button>
      </form>

      {/* Séparateur */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Ou</span>
        </div>
      </div>

      {/* Bouton Google */}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continuer avec Google
      </Button>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          {mode === 'login' ? (
            <>
              Pas encore de compte ?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-blue-600 hover:underline font-medium"
              >
                S'inscrire
              </button>
            </>
          ) : (
            <>
              Déjà un compte ?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-blue-600 hover:underline font-medium"
              >
                Se connecter
              </button>
            </>
          )}
        </p>
      </div>
    </Card>
  )
}