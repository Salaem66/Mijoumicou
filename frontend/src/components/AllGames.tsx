import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Game } from '../types';
import { useAuth } from '../hooks/useAuth';
import { LibraryService } from '../lib/supabase';
import { libraryCacheService } from '../services/libraryCache';
import GameCard from './GameCard';

interface AllGamesProps {
  allGames: Game[];
  onClose: () => void;
  onOpenGameModal: (game: Game, event: React.MouseEvent<HTMLButtonElement>) => void;
}

const AllGames: React.FC<AllGamesProps> = ({ allGames, onClose, onOpenGameModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'duration' | 'complexity'>('name');
  const [libraryGameIds, setLibraryGameIds] = useState<Set<number>>(new Set());
  const { user } = useAuth();

  // Charger la bibliothèque utilisateur avec cache
  useEffect(() => {
    const loadLibrary = async () => {
      if (!user) {
        setLibraryGameIds(new Set());
        return;
      }
      
      try {
        // Utiliser le cache service pour éviter les requêtes multiples
        const gameIds = await libraryCacheService.loadUserLibrary(user.id, LibraryService);
        setLibraryGameIds(gameIds);
      } catch (error) {
        console.error('Erreur lors du chargement de la bibliothèque:', error);
        setLibraryGameIds(new Set());
      }
    };

    loadLibrary();
  }, [user]);

  // Filtrer et trier les jeux
  const processedGames = useMemo(() => {
    let games = allGames;

    // Filtrer par terme de recherche
    if (searchTerm.trim()) {
      games = games.filter(game =>
        game.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.type_principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.tags_mood.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Trier
    games.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.nom.localeCompare(b.nom);
        case 'type':
          return a.type_principal.localeCompare(b.type_principal);
        case 'duration':
          return a.duree_moyenne - b.duree_moyenne;
        case 'complexity':
          return a.complexite - b.complexite;
        default:
          return 0;
      }
    });

    return games;
  }, [allGames, searchTerm, sortBy]);

  // Suggestions pour l'auto-complétion
  const suggestions = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const gameNames = allGames
      .filter(game => game.nom.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(game => game.nom)
      .slice(0, 5);
    
    const gameTypesSet = new Set(allGames
      .filter(game => game.type_principal.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(game => game.type_principal));
    const gameTypes = Array.from(gameTypesSet).slice(0, 3);
    
    const tagsSet = new Set(allGames
      .flatMap(game => game.tags_mood)
      .filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const tags = Array.from(tagsSet).slice(0, 3);
    
    return [...gameNames, ...gameTypes, ...tags];
  }, [allGames, searchTerm]);

  useEffect(() => {
    setFilteredGames(processedGames);
  }, [processedGames]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0) {
        handleSuggestionClick(suggestions[selectedSuggestionIndex]);
      }
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };


  const stats = useMemo(() => {
    const total = allGames.length;
    const inLibrary = allGames.filter(game => libraryGameIds.has(game.id)).length;
    const avgDuration = Math.round(allGames.reduce((acc, game) => acc + game.duree_moyenne, 0) / total);
    const avgComplexity = Math.round(allGames.reduce((acc, game) => acc + game.complexite, 0) / total * 10) / 10;
    
    return { total, inLibrary, avgDuration, avgComplexity };
  }, [allGames, libraryGameIds]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen size={28} />
              <div>
                <h2 className="text-2xl font-bold">Tous les jeux</h2>
                <p className="text-blue-100">Explorez notre collection complète</p>
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

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Jeux disponibles</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.inLibrary}</div>
                <div className="text-sm text-gray-600">Dans ma bibliothèque</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.avgDuration}</div>
                <div className="text-sm text-gray-600">Durée moyenne (min)</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.avgComplexity}</div>
                <div className="text-sm text-gray-600">Complexité moyenne</div>
              </CardContent>
            </Card>
          </div>

          {/* Recherche et filtres */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher un jeu, un type, ou un tag..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-10"
                />
              </div>
              
              {/* Suggestions d'auto-complétion */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                  >
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={suggestion}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                          index === selectedSuggestionIndex ? 'bg-purple-50' : ''
                        }`}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tri */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Trier par :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="name">Nom</option>
                <option value="type">Type</option>
                <option value="duration">Durée</option>
                <option value="complexity">Complexité</option>
              </select>
            </div>
          </div>

          {/* Résultats */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {filteredGames.length} jeu{filteredGames.length > 1 ? 'x' : ''} trouvé{filteredGames.length > 1 ? 's' : ''}
              {searchTerm && ` pour "${searchTerm}"`}
            </p>
          </div>

          {/* Liste des jeux */}
          {filteredGames.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun jeu trouvé
              </h3>
              <p className="text-gray-600">
                Essayez de modifier votre recherche ou vos filtres.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onOpenModal={onOpenGameModal}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AllGames;