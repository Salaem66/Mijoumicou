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