import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Zap, Brain, Target, Shield, TrendingUp, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { Game } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from '../hooks/useAuth';
import { LibraryService } from '../lib/supabase';

interface GameCardProps {
  game: Game;
  rank?: number;
  showCompatibility?: boolean;
  onOpenModal: (game: Game, event: React.MouseEvent<HTMLButtonElement>) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, rank, showCompatibility = false, onOpenModal }) => {
  const { user } = useAuth();
  const [inLibrary, setInLibrary] = useState(false);
  const [loading, setLoading] = useState(false);

  // Vérifier si le jeu est dans la bibliothèque au chargement
  useEffect(() => {
    const checkLibraryStatus = async () => {
      if (!user) return;
      
      try {
        const isInLibrary = await LibraryService.isInLibrary(user.id, game.id);
        setInLibrary(isInLibrary);
      } catch (error) {
        console.error('Erreur lors de la vérification de la bibliothèque:', error);
      }
    };

    checkLibraryStatus();
  }, [user, game.id]);

  const handleLibraryToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher l'ouverture de la modale
    if (!user) return;
    
    setLoading(true);
    try {
      if (inLibrary) {
        await LibraryService.removeFromLibrary(user.id, game.id);
        setInLibrary(false);
      } else {
        await LibraryService.addToLibrary(user.id, game.id);
        setInLibrary(true);
      }
    } catch (error) {
      console.error('Erreur lors de la modification de la bibliothèque:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getComplexityColor = (complexity: number) => {
    if (complexity <= 2) return 'text-green-600 bg-green-50 border-green-200';
    if (complexity <= 3.5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getComplexityText = (complexity: number) => {
    if (complexity <= 2) return 'Simple';
    if (complexity <= 3.5) return 'Modéré';
    return 'Complexe';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'party': 'bg-purple-100 text-purple-800 border-purple-200',
      'famille': 'bg-blue-100 text-blue-800 border-blue-200',
      'strategie': 'bg-red-100 text-red-800 border-red-200',
      'cooperatif': 'bg-green-100 text-green-800 border-green-200',
      'ambiance': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDuration = (min: number, max: number) => {
    if (min === max) return `${min}min`;
    return `${min}-${max}min`;
  };

  const formatPlayers = (min: number, max: number) => {
    if (min === max) return `${min}`;
    return `${min}-${max}`;
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: (rank || 0) * 0.1 }}
      className="game-card group"
    >
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Header avec ranking et score */}
        <CardHeader className="relative">
          {rank && (
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                {rank}
              </Badge>
            </div>
          )}
          
          {showCompatibility && game.compatibility_score && (
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                {game.compatibility_score}%
              </Badge>
            </div>
          )}

          {/* Type et complexité */}
          <div className={`${rank ? 'pt-8' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <Badge className={`${getTypeColor(game.type_principal)}`}>
                {game.type_principal}
              </Badge>
              <Badge className={`${getComplexityColor(game.complexite)}`}>
                {getComplexityText(game.complexite)}
              </Badge>
            </div>

            {/* Titre */}
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
              {game.nom}
            </h3>
            
            {/* Description courte */}
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {game.description_courte}
            </p>
          </div>
        </CardHeader>

        <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-blue-500" />
            <span className="text-sm text-gray-700">
              {formatDuration(game.duree_min, game.duree_max)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users size={16} className="text-green-500" />
            <span className="text-sm text-gray-700">
              {formatPlayers(game.joueurs_min, game.joueurs_max)} joueurs
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Target size={16} className="text-purple-500" />
            <span className="text-sm text-gray-700">
              {game.age_minimum}+ ans
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              {game.prix_moyen}€
            </span>
          </div>
        </div>

        {/* Métriques de mood */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center">
            <Zap size={14} className="text-yellow-500 mx-auto mb-1" />
            <div className="text-xs text-gray-500">Énergie</div>
            <div className="text-sm font-semibold">{game.energie_requise.toFixed(1)}</div>
          </div>
          
          <div className="text-center">
            <Users size={14} className="text-blue-500 mx-auto mb-1" />
            <div className="text-xs text-gray-500">Social</div>
            <div className="text-sm font-semibold">{game.niveau_social.toFixed(1)}</div>
          </div>
          
          <div className="text-center">
            <Brain size={14} className="text-purple-500 mx-auto mb-1" />
            <div className="text-xs text-gray-500">Stratégie</div>
            <div className="text-sm font-semibold">{(5 - game.facteur_chance).toFixed(1)}</div>
          </div>
          
          <div className="text-center">
            <TrendingUp size={14} className="text-green-500 mx-auto mb-1" />
            <div className="text-xs text-gray-500">Rejouabilité</div>
            <div className="text-sm font-semibold">{game.rejouabilite.toFixed(1)}</div>
          </div>
        </div>

          {/* Tags mood */}
          {game.tags_mood && game.tags_mood.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {game.tags_mood.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-gray-100 text-gray-600 text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
                {game.tags_mood.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-600 text-xs"
                  >
                    +{game.tags_mood.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

        {/* Explications de compatibilité */}
        {showCompatibility && game.match_explanations && game.match_explanations.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
            <h4 className="text-sm font-semibold text-green-800 mb-2">Pourquoi ce jeu ?</h4>
            <ul className="space-y-1">
              {game.match_explanations.slice(0, 2).map((explanation, index) => (
                <li key={index} className="text-xs text-green-700 flex items-center">
                  <Shield size={12} className="mr-1 text-green-500" />
                  {explanation}
                </li>
              ))}
            </ul>
          </div>
        )}

          {/* Points forts */}
          {game.points_forts && game.points_forts.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Points forts</h4>
              <div className="space-y-1">
                {game.points_forts.slice(0, 2).map((point, index) => (
                  <div key={index} className="text-xs text-gray-600 flex items-center">
                    <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                    {point}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer avec boutons d'action */}
          <div className="mt-6 space-y-3">
            {/* Bouton détails principal */}
            <Button
              onClick={(e) => onOpenModal(game, e)}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            >
              Voir les détails
            </Button>
            
            {/* Bouton bibliothèque */}
            <Button
              onClick={handleLibraryToggle}
              disabled={!user || loading}
              variant={inLibrary ? "default" : "outline"}
              className={`w-full ${inLibrary 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'border-green-600 text-green-600 hover:bg-green-50'
              } transition-all duration-200`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  {inLibrary ? 'Suppression...' : 'Ajout...'}
                </>
              ) : inLibrary ? (
                <>
                  <BookmarkCheck size={16} className="mr-2" />
                  Dans ma bibliothèque
                </>
              ) : (
                <>
                  <BookmarkPlus size={16} className="mr-2" />
                  {user ? 'Ajouter à ma bibliothèque' : 'Connexion requise'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GameCard;