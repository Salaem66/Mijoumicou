import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, X, Save, Edit3, Settings, Gamepad2, Heart, Clock, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../hooks/useAuth';
import { UserProfileService } from '../lib/supabase';

interface UserProfileProps {
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    complexity_preference: profile?.complexity_preference || 3,
    duration_preference: profile?.duration_preference || 60,
    player_count_preference: profile?.player_count_preference || 4,
  });

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await UserProfileService.updateProfile(user.id, {
        username: formData.username,
        full_name: formData.full_name,
        complexity_preference: formData.complexity_preference,
        duration_preference: formData.duration_preference,
        player_count_preference: formData.player_count_preference,
      });
      
      await refreshProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      alert('Erreur lors de la mise à jour du profil.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: profile?.username || '',
      full_name: profile?.full_name || '',
      complexity_preference: profile?.complexity_preference || 3,
      duration_preference: profile?.duration_preference || 60,
      player_count_preference: profile?.player_count_preference || 4,
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
        >
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Connexion requise
          </h3>
          <p className="text-gray-600 mb-6">
            Veuillez vous connecter pour accéder à votre profil.
          </p>
          <Button onClick={onClose} className="w-full">
            Fermer
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User size={28} />
              <div>
                <h2 className="text-2xl font-bold">Mon Profil</h2>
                <p className="text-blue-100">Personnalisez vos préférences de jeu</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white hover:bg-opacity-20"
                >
                  <Edit3 size={20} />
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <X size={24} />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Informations personnelles */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={20} />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Email non modifiable</p>
              </div>
              
              <div>
                <Label htmlFor="full_name">Nom complet</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Votre nom complet"
                />
              </div>
              
              <div>
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Nom d'utilisateur unique"
                />
              </div>
            </CardContent>
          </Card>

          {/* Préférences de jeu */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 size={20} />
                Préférences de jeu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-purple-600" />
                    <Label>Complexité préférée</Label>
                  </div>
                  <span className="text-sm font-medium text-purple-600">{formData.complexity_preference}/5</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.complexity_preference}
                    onChange={(e) => setFormData(prev => ({ ...prev, complexity_preference: parseInt(e.target.value) }))}
                    disabled={!isEditing}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(formData.complexity_preference - 1) * 25}%, #e5e7eb ${(formData.complexity_preference - 1) * 25}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Simple</span>
                  <span>Intermédiaire</span>
                  <span>Expert</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" />
                    <Label>Durée préférée</Label>
                  </div>
                  <span className="text-sm font-medium text-blue-600">{formData.duration_preference} min</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="15"
                    max="180"
                    step="15"
                    value={formData.duration_preference}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_preference: parseInt(e.target.value) }))}
                    disabled={!isEditing}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((formData.duration_preference - 15) / 165) * 100}%, #e5e7eb ${((formData.duration_preference - 15) / 165) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>15min</span>
                  <span>1h</span>
                  <span>3h</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-red-600" />
                    <Label>Nombre de joueurs idéal</Label>
                  </div>
                  <span className="text-sm font-medium text-red-600">{formData.player_count_preference} joueur{formData.player_count_preference > 1 ? 's' : ''}</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={formData.player_count_preference}
                    onChange={(e) => setFormData(prev => ({ ...prev, player_count_preference: parseInt(e.target.value) }))}
                    disabled={!isEditing}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${((formData.player_count_preference - 1) / 7) * 100}%, #e5e7eb ${((formData.player_count_preference - 1) / 7) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Solo</span>
                  <span>4 joueurs</span>
                  <span>8+</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {isEditing && (
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex-1"
              >
                <Save size={16} className="mr-2" />
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={loading}
              >
                Annuler
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;