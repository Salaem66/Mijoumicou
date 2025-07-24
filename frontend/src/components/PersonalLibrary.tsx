import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Library, BookOpen, Trash2, Search, X, Star, MessageCircle, Edit3, Heart, HeartOff } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useAuth } from '../hooks/useAuth';
import { LibraryService, FavoritesService } from '../lib/supabase';
import { libraryCacheService } from '../services/libraryCache';
import { Game } from '../types';

interface PersonalLibraryProps {
  onClose: () => void;
  onOpenGameModal: (game: Game, event: React.MouseEvent<HTMLButtonElement>) => void;
}

interface LibraryGame extends Game {
  library_rating?: number;
  library_notes?: string;
  library_added_at?: string;
  is_favorite?: boolean;
}

const PersonalLibrary: React.FC<PersonalLibraryProps> = ({ onClose, onOpenGameModal }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [libraryGames, setLibraryGames] = useState<LibraryGame[]>([]);
  const [filteredGames, setFilteredGames] = useState<LibraryGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRating, setEditingRating] = useState<{ gameId: number; rating: number } | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ gameId: number; notes: string } | null>(null);
  const [favoriteGames, setFavoriteGames] = useState<Set<number>>(new Set());
  const [hasLoaded, setHasLoaded] = useState(false);

  // Charger la bibliothèque personnelle depuis Supabase une seule fois
  useEffect(() => {
    if (!user || hasLoaded) return;

    const loadPersonalLibrary = async () => {
      try {
        setLoading(true);
        console.log('🔄 Chargement bibliothèque pour user:', user.id);
        
        // Utiliser le cache pour la bibliothèque, appel direct pour les favoris (moins fréquent)
        const [, favoritesData] = await Promise.all([
          libraryCacheService.loadUserLibrary(user.id, LibraryService),
          FavoritesService.getUserFavorites(user.id)
        ]);
        
        // Récupérer les données complètes de la bibliothèque depuis le cache
        const libraryData = await LibraryService.getUserLibrary(user.id);

        console.log('📚 Données bibliothèque:', libraryData);
        console.log('❤️ Données favoris:', favoritesData);

        // Mapper les données de la bibliothèque avec les informations des jeux
        const games: LibraryGame[] = libraryData.map((entry: any) => ({
          ...entry.games, // Données du jeu
          library_rating: entry.rating,
          library_notes: entry.notes,
          library_added_at: entry.added_at,
          is_favorite: favoritesData.some(fav => fav.id === entry.game_id)
        }));

        console.log('🎮 Jeux mappés:', games);
        setLibraryGames(games);
        setFavoriteGames(new Set(favoritesData.map(game => game.id)));
        setHasLoaded(true); // Marquer comme chargé
      } catch (error) {
        console.error('❌ Erreur lors du chargement de la bibliothèque:', error);
        // En cas d'erreur, on affiche une bibliothèque vide plutôt que de rester en chargement
        setLibraryGames([]);
        setFavoriteGames(new Set());
        setHasLoaded(true); // Même en cas d'erreur, on ne relance pas
      } finally {
        setLoading(false);
      }
    };

    loadPersonalLibrary();
  }, [user, hasLoaded]);

  // Filtrer les jeux selon le terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGames(libraryGames);
    } else {
      const filtered = libraryGames.filter(game =>
        game.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.type_principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.tags_mood?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        game.library_notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGames(filtered);
    }
  }, [searchTerm, libraryGames]);

  const handleRemoveFromLibrary = async (gameId: number) => {
    if (!user) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir retirer ce jeu de votre bibliothèque ?')) {
      try {
        await LibraryService.removeFromLibrary(user.id, gameId);
        setLibraryGames(prev => prev.filter(game => game.id !== gameId));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du jeu.');
      }
    }
  };

  const handleUpdateRating = async (gameId: number, rating: number) => {
    if (!user) return;

    try {
      await LibraryService.updateLibraryEntry(user.id, gameId, { rating });
      setLibraryGames(prev => prev.map(game => 
        game.id === gameId ? { ...game, library_rating: rating } : game
      ));
      setEditingRating(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note:', error);
      alert('Erreur lors de la mise à jour de la note.');
    }
  };

  const handleUpdateNotes = async (gameId: number, notes: string) => {
    if (!user) return;

    try {
      await LibraryService.updateLibraryEntry(user.id, gameId, { notes });
      setLibraryGames(prev => prev.map(game => 
        game.id === gameId ? { ...game, library_notes: notes } : game
      ));
      setEditingNotes(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notes:', error);
      alert('Erreur lors de la mise à jour des notes.');
    }
  };

  const handleToggleFavorite = async (gameId: number) => {
    if (!user) return;

    try {
      const isFav = favoriteGames.has(gameId);
      
      if (isFav) {
        await FavoritesService.removeFromFavorites(user.id, gameId);
        setFavoriteGames(prev => {
          const newSet = new Set(prev);
          newSet.delete(gameId);
          return newSet;
        });
      } else {
        await FavoritesService.addToFavorites(user.id, gameId);
        setFavoriteGames(prev => {
          const newSet = new Set(prev);
          newSet.add(gameId);
          return newSet;
        });
      }
      
      // Mettre à jour le statut favori dans la liste
      setLibraryGames(prev => prev.map(game => 
        game.id === gameId ? { ...game, is_favorite: !isFav } : game
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
      alert('Erreur lors de la mise à jour des favoris.');
    }
  };

  const getLibraryStats = useCallback(() => {
    if (libraryGames.length === 0) {
      return {
        totalGames: 0,
        averageDuration: 0,
        averageComplexity: 0,
        averageRating: 0,
        favoritesCount: 0
      };
    }

    const ratedGames = libraryGames.filter(g => g.library_rating && g.library_rating > 0);
    
    return {
      totalGames: libraryGames.length,
      averageDuration: Math.round(libraryGames.reduce((acc, game) => acc + game.duree_moyenne, 0) / libraryGames.length),
      averageComplexity: Math.round(libraryGames.reduce((acc, game) => acc + game.complexite, 0) / libraryGames.length * 10) / 10,
      averageRating: ratedGames.length > 0 ? Math.round(ratedGames.reduce((acc, game) => acc + (game.library_rating || 0), 0) / ratedGames.length * 10) / 10 : 0,
      favoritesCount: favoriteGames.size
    };
  }, [libraryGames, favoriteGames]);

  const getTypeStats = useCallback(() => {
    const typeCount: { [key: string]: number } = {};
    libraryGames.forEach(game => {
      typeCount[game.type_principal] = (typeCount[game.type_principal] || 0) + 1;
    });
    return Object.entries(typeCount).sort((a, b) => b[1] - a[1]);
  }, [libraryGames]);

  const stats = getLibraryStats();
  const typeStats = getTypeStats();

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
        >
          <Library size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Connexion requise
          </h3>
          <p className="text-gray-600 mb-6">
            Veuillez vous connecter pour accéder à votre bibliothèque personnelle.
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
        className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Library size={28} />
              <div>
                <h2 className="text-2xl font-bold">Ma Bibliothèque Personnelle</h2>
                <p className="text-blue-100">Vos jeux avec notes et évaluations</p>
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
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement de votre bibliothèque...</p>
            </div>
          ) : (
            <>
              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalGames}</div>
                    <div className="text-sm text-gray-600">Jeux total</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.averageDuration}min</div>
                    <div className="text-sm text-gray-600">Durée moyenne</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.averageComplexity}</div>
                    <div className="text-sm text-gray-600">Complexité moy.</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.averageRating || 'N/A'}</div>
                    <div className="text-sm text-gray-600">Note moyenne</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.favoritesCount}</div>
                    <div className="text-sm text-gray-600">Favoris</div>
                  </CardContent>
                </Card>
              </div>

              {/* Types de jeux */}
              {typeStats.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Répartition par type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {typeStats.map(([type, count]) => (
                        <Badge key={type} variant="secondary" className="text-sm">
                          {type} ({count})
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recherche */}
              <div className="flex items-center space-x-2 mb-6">
                <Search size={20} className="text-gray-400" />
                <Input
                  placeholder="Rechercher dans ma bibliothèque (nom, type, notes...)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>

              {/* Liste des jeux */}
              {filteredGames.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {libraryGames.length === 0 ? 'Aucun jeu dans votre bibliothèque' : 'Aucun jeu trouvé'}
                  </h3>
                  <p className="text-gray-600">
                    {libraryGames.length === 0 
                      ? 'Ajoutez des jeux à votre bibliothèque personnelle en vous connectant !'
                      : 'Essayez de modifier votre recherche.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredGames.map((game) => (
                    <Card key={game.id} className="p-6">
                      <div className="flex gap-6">
                        {/* Informations du jeu */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{game.nom}</h3>
                                <Button
                                  onClick={() => handleToggleFavorite(game.id)}
                                  variant="ghost"
                                  size="sm"
                                  className={`p-1 ${favoriteGames.has(game.id) ? 'text-red-500' : 'text-gray-400'}`}
                                >
                                  {favoriteGames.has(game.id) ? <Heart size={20} fill="currentColor" /> : <HeartOff size={20} />}
                                </Button>
                              </div>
                              <p className="text-gray-600 mb-2">{game.description_courte}</p>
                              <div className="flex gap-2 mb-3">
                                <Badge variant="outline">{game.type_principal}</Badge>
                                <Badge variant="secondary">{game.joueurs_min}-{game.joueurs_max} joueurs</Badge>
                                <Badge variant="secondary">{game.duree_moyenne}min</Badge>
                                <Badge variant="secondary">Complexité: {game.complexite}/5</Badge>
                              </div>
                              <p className="text-sm text-gray-500">
                                Ajouté le {new Date(game.library_added_at || '').toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                onClick={(e) => onOpenGameModal(game, e)}
                                variant="outline"
                                size="sm"
                              >
                                Voir détails
                              </Button>
                              <Button
                                onClick={() => handleRemoveFromLibrary(game.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Note personnelle */}
                          <div className="mb-4">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-medium text-gray-700">Ma note:</span>
                              {editingRating?.gameId === game.id ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <button
                                        key={star}
                                        onClick={() => setEditingRating({ gameId: game.id, rating: star })}
                                        className={`p-1 ${star <= editingRating.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                      >
                                        <Star size={16} fill="currentColor" />
                                      </button>
                                    ))}
                                  </div>
                                  <Button size="sm" onClick={() => handleUpdateRating(game.id, editingRating.rating)}>OK</Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingRating(null)}>Annuler</Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        size={16}
                                        className={star <= (game.library_rating || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600">({game.library_rating || 'Non notée'})</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingRating({ gameId: game.id, rating: game.library_rating || 3 })}
                                  >
                                    <Edit3 size={14} />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Notes personnelles */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <MessageCircle size={16} className="text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">Mes notes:</span>
                              {!editingNotes || editingNotes.gameId !== game.id ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingNotes({ gameId: game.id, notes: game.library_notes || '' })}
                                >
                                  <Edit3 size={14} />
                                </Button>
                              ) : null}
                            </div>
                            
                            {editingNotes?.gameId === game.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingNotes.notes}
                                  onChange={(e) => setEditingNotes({ ...editingNotes, notes: e.target.value })}
                                  placeholder="Ajoutez vos notes personnelles sur ce jeu..."
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleUpdateNotes(game.id, editingNotes.notes)}>Sauvegarder</Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingNotes(null)}>Annuler</Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600 italic">
                                {game.library_notes || 'Aucune note personnelle'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PersonalLibrary;