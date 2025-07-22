import React, { useState } from 'react'
import { X } from 'lucide-react'
import { AuthForm } from './AuthForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultMode?: 'login' | 'register'
}

export function AuthModal({ isOpen, onClose, onSuccess, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode)

  if (!isOpen) return null

  const handleSuccess = () => {
    onSuccess()
    onClose()
  }

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-2">
          <AuthForm 
            mode={mode}
            onSuccess={handleSuccess}
            onToggleMode={toggleMode}
          />
        </div>
      </div>
    </div>
  )
}