import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Save, AlertCircle, Users, Star, Gamepad2, Tags, Target, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from './ui/button';
// Card components not used in current implementation
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { apiService } from '../services/api';

interface AddGameFormProps {
  onClose: () => void;
  onGameAdded: (game: any) => void;
}

interface GameFormData {
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
  points_faibles: string[];
  conseil_animation: string;
  similar_to: string[];
  si_vous_aimez: string[];
}

const AddGameForm: React.FC<AddGameFormProps> = ({ onClose, onGameAdded }) => {
  const [formData, setFormData] = useState<GameFormData>({
    nom: '',
    nom_anglais: '',
    description_courte: '',
    description_complete: '',
    joueurs_min: 2,
    joueurs_max: 4,
    joueurs_ideal: 3,
    duree_min: 30,
    duree_max: 60,
    duree_moyenne: 45,
    age_minimum: 10,
    complexite: 3,
    prix_moyen: 40,
    type_principal: '',
    mecaniques: [],
    themes: [],
    energie_requise: 3,
    niveau_social: 3,
    facteur_chance: 3,
    tension_niveau: 3,
    courbe_apprentissage: 3,
    rejouabilite: 3,
    niveau_conflit: 3,
    tags_mood: [],
    contextes_adaptes: [],
    points_forts: [],
    points_faibles: [],
    conseil_animation: '',
    similar_to: [],
    si_vous_aimez: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Listes prédéfinies pour les dropdowns
  const typesJeux = [
    'famille', 'strategie', 'aventure', 'cooperatif', 'party', 'abstrait',
    'economique', 'guerre', 'expert', 'enfant', 'rapide', 'long'
  ];

  const mecaniquesSuggestions = [
    'Placement d\'ouvriers', 'Gestion de ressources', 'Deck-building', 'Draft',
    'Placement de tuiles', 'Collecte d\'objets', 'Enchères', 'Négociation',
    'Coopératif', 'Asymétrique', 'Simultané', 'Tours de main', 'Cartes',
    'Dés', 'Puzzle', 'Déduction', 'Bluff', 'Contrôle de territoire'
  ];

  const themesSuggestions = [
    'Fantasy', 'Science-fiction', 'Historique', 'Moderne', 'Futuriste',
    'Médiéval', 'Antiquité', 'Nature', 'Animaux', 'Espace', 'Océan',
    'Ville', 'Ferme', 'Commerce', 'Guerre', 'Aventure', 'Mystère', 'Horreur'
  ];

  const tagsMoodSuggestions = [
    'relaxant', 'intense', 'amusant', 'stratégique', 'familial', 'rapide',
    'complexe', 'accessible', 'coopératif', 'compétitif', 'créatif', 'zen',
    'épique', 'tactique', 'social', 'immersif', 'développement', 'aventure'
  ];

  const contextesSuggestions = [
    'Famille', 'Amis', 'Couple', 'Débutants', 'Experts', 'Enfants',
    'Soirée', 'Apéritif', 'Groupe', 'Tournoi', 'Initiation', 'Détente'
  ];

  const handleInputChange = (field: keyof GameFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInput = (field: keyof GameFormData, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: keyof GameFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await apiService.addGame(formData);
      setSuccess(true);
      onGameAdded(result.game);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nom">Nom du jeu *</Label>
          <Input
            id="nom"
            value={formData.nom}
            onChange={(e) => handleInputChange('nom', e.target.value)}
            placeholder="Ex: Azul"
            required
          />
        </div>
        <div>
          <Label htmlFor="nom_anglais">Nom anglais</Label>
          <Input
            id="nom_anglais"
            value={formData.nom_anglais}
            onChange={(e) => handleInputChange('nom_anglais', e.target.value)}
            placeholder="Ex: Azul (si différent)"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description_courte">Description courte *</Label>
        <Textarea
          id="description_courte"
          value={formData.description_courte}
          onChange={(e) => handleInputChange('description_courte', e.target.value)}
          placeholder="Résumé en une phrase du jeu"
          rows={2}
          required
        />
      </div>

      <div>
        <Label htmlFor="description_complete">Description complète *</Label>
        <Textarea
          id="description_complete"
          value={formData.description_complete}
          onChange={(e) => handleInputChange('description_complete', e.target.value)}
          placeholder="Description détaillée du gameplay, de l'univers et des mécaniques"
          rows={4}
          required
        />
      </div>

      <div>
        <Label htmlFor="type_principal">Type principal *</Label>
        <select
          id="type_principal"
          value={formData.type_principal}
          onChange={(e) => handleInputChange('type_principal', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        >
          <option value="">Sélectionner un type</option>
          {typesJeux.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="joueurs_min">Joueurs min *</Label>
          <Input
            id="joueurs_min"
            type="number"
            min="1"
            max="12"
            value={formData.joueurs_min}
            onChange={(e) => handleInputChange('joueurs_min', parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="joueurs_max">Joueurs max *</Label>
          <Input
            id="joueurs_max"
            type="number"
            min="1"
            max="12"
            value={formData.joueurs_max}
            onChange={(e) => handleInputChange('joueurs_max', parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="joueurs_ideal">Joueurs idéal</Label>
          <Input
            id="joueurs_ideal"
            type="number"
            min="1"
            max="12"
            value={formData.joueurs_ideal}
            onChange={(e) => handleInputChange('joueurs_ideal', parseInt(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="age_minimum">Âge minimum *</Label>
          <Input
            id="age_minimum"
            type="number"
            min="3"
            max="18"
            value={formData.age_minimum}
            onChange={(e) => handleInputChange('age_minimum', parseInt(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="duree_min">Durée min (min) *</Label>
          <Input
            id="duree_min"
            type="number"
            min="5"
            max="600"
            value={formData.duree_min}
            onChange={(e) => handleInputChange('duree_min', parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="duree_max">Durée max (min) *</Label>
          <Input
            id="duree_max"
            type="number"
            min="5"
            max="600"
            value={formData.duree_max}
            onChange={(e) => handleInputChange('duree_max', parseInt(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="duree_moyenne">Durée moyenne (min)</Label>
          <Input
            id="duree_moyenne"
            type="number"
            min="5"
            max="600"
            value={formData.duree_moyenne}
            onChange={(e) => handleInputChange('duree_moyenne', parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="complexite">Complexité (1-5) *</Label>
          <Input
            id="complexite"
            type="number"
            min="1"
            max="5"
            step="0.1"
            value={formData.complexite}
            onChange={(e) => handleInputChange('complexite', parseFloat(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="prix_moyen">Prix moyen (€)</Label>
          <Input
            id="prix_moyen"
            type="number"
            min="0"
            max="200"
            value={formData.prix_moyen}
            onChange={(e) => handleInputChange('prix_moyen', parseFloat(e.target.value))}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label>Mécaniques</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.mecaniques.map((item, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {item}
              <button
                onClick={() => removeArrayItem('mecaniques', index)}
                className="ml-1 hover:text-red-500"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleArrayInput('mecaniques', e.target.value);
                e.target.value = '';
              }
            }}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Ajouter une mécanique</option>
            {mecaniquesSuggestions.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label>Thèmes</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.themes.map((item, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {item}
              <button
                onClick={() => removeArrayItem('themes', index)}
                className="ml-1 hover:text-red-500"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleArrayInput('themes', e.target.value);
                e.target.value = '';
              }
            }}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Ajouter un thème</option>
            {themesSuggestions.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label>Tags d'ambiance</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags_mood.map((item, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {item}
              <button
                onClick={() => removeArrayItem('tags_mood', index)}
                className="ml-1 hover:text-red-500"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleArrayInput('tags_mood', e.target.value);
                e.target.value = '';
              }
            }}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Ajouter un tag d'ambiance</option>
            {tagsMoodSuggestions.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label>Contextes adaptés</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.contextes_adaptes.map((item, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {item}
              <button
                onClick={() => removeArrayItem('contextes_adaptes', index)}
                className="ml-1 hover:text-red-500"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleArrayInput('contextes_adaptes', e.target.value);
                e.target.value = '';
              }
            }}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Ajouter un contexte</option>
            {contextesSuggestions.map(item => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Métriques de gameplay (1-5)</Label>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="energie_requise">Énergie requise: {formData.energie_requise}</Label>
              <input
                id="energie_requise"
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={formData.energie_requise}
                onChange={(e) => handleInputChange('energie_requise', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="niveau_social">Niveau social: {formData.niveau_social}</Label>
              <input
                id="niveau_social"
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={formData.niveau_social}
                onChange={(e) => handleInputChange('niveau_social', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="facteur_chance">Facteur chance: {formData.facteur_chance}</Label>
              <input
                id="facteur_chance"
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={formData.facteur_chance}
                onChange={(e) => handleInputChange('facteur_chance', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="tension_niveau">Niveau de tension: {formData.tension_niveau}</Label>
              <input
                id="tension_niveau"
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={formData.tension_niveau}
                onChange={(e) => handleInputChange('tension_niveau', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div>
          <Label>Métriques d'expérience (1-5)</Label>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="courbe_apprentissage">Courbe d'apprentissage: {formData.courbe_apprentissage}</Label>
              <input
                id="courbe_apprentissage"
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={formData.courbe_apprentissage}
                onChange={(e) => handleInputChange('courbe_apprentissage', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="rejouabilite">Rejouabilité: {formData.rejouabilite}</Label>
              <input
                id="rejouabilite"
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={formData.rejouabilite}
                onChange={(e) => handleInputChange('rejouabilite', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="niveau_conflit">Niveau de conflit: {formData.niveau_conflit}</Label>
              <input
                id="niveau_conflit"
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={formData.niveau_conflit}
                onChange={(e) => handleInputChange('niveau_conflit', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Points forts</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.points_forts.map((item, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <ThumbsUp size={12} />
                {item}
                <button
                  onClick={() => removeArrayItem('points_forts', index)}
                  className="ml-1 hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter un point fort"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleArrayInput('points_forts', e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </div>

        <div>
          <Label>Points faibles</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.points_faibles.map((item, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <ThumbsDown size={12} />
                {item}
                <button
                  onClick={() => removeArrayItem('points_faibles', index)}
                  className="ml-1 hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter un point faible"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleArrayInput('points_faibles', e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="conseil_animation">Conseil d'animation</Label>
        <Textarea
          id="conseil_animation"
          value={formData.conseil_animation}
          onChange={(e) => handleInputChange('conseil_animation', e.target.value)}
          placeholder="Conseils pour bien animer ce jeu"
          rows={3}
        />
      </div>
    </div>
  );

  const steps = [
    { title: 'Informations générales', icon: Gamepad2 },
    { title: 'Paramètres de jeu', icon: Users },
    { title: 'Mécaniques et thèmes', icon: Tags },
    { title: 'Évaluation et conseils', icon: Star }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Plus size={28} />
              <div>
                <h2 className="text-2xl font-bold">Ajouter un jeu</h2>
                <p className="text-green-100">Créer une nouvelle fiche de jeu</p>
              </div>
            </div>
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

        {/* Steps indicator */}
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b flex-shrink-0">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === index + 1;
            const isCompleted = currentStep > index + 1;
            
            return (
              <div
                key={index}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  isActive ? 'bg-green-100 text-green-700' : 
                  isCompleted ? 'bg-gray-100 text-gray-600' : 'text-gray-400'
                }`}
              >
                <StepIcon size={16} />
                <span className="text-sm font-medium">{step.title}</span>
              </div>
            );
          })}
        </div>

        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="text-green-600 mb-4">
                  <Target size={48} className="mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  Jeu ajouté avec succès !
                </h3>
                <p className="text-gray-600">
                  Le jeu "{formData.nom}" a été ajouté à la base de données.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <form onSubmit={handleSubmit}>
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                  {currentStep === 4 && renderStep4()}
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
            >
              <AlertCircle size={20} className="text-red-600" />
              <span className="text-red-700">{error}</span>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center flex-shrink-0 border-t">
            <div className="flex space-x-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                >
                  Précédent
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={currentStep === 1 && (!formData.nom || !formData.description_courte)}
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Ajouter le jeu
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AddGameForm;