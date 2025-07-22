import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Library, BookOpen, Trash2, Download, Upload, Search, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { useLibrary } from '../services/library';
import { Game } from '../types';
import GameCard from './GameCard';

interface LibraryProps {
  allGames: Game[];
  onClose: () => void;
  onOpenGameModal: (game: Game, event: React.MouseEvent<HTMLButtonElement>) => void;
}

const LibraryComponent: React.FC<LibraryProps> = ({ allGames, onClose, onOpenGameModal }) => {
  const { getGameIds, getLibraryStats, clearLibrary, exportLibrary, importLibrary } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [libraryGames, setLibraryGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [stats, setStats] = useState(getLibraryStats());

  // Charger les jeux de la bibliothèque
  useEffect(() => {
    const gameIds = getGameIds();
    const games = allGames.filter(game => gameIds.includes(game.id.toString()));
    setLibraryGames(games);
    setStats(getLibraryStats());
  }, [allGames, getGameIds, getLibraryStats]);

  // Filtrer les jeux selon le terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGames(libraryGames);
    } else {
      const filtered = libraryGames.filter(game =>
        game.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.type_principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.tags_mood.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredGames(filtered);
    }
  }, [searchTerm, libraryGames]);

  const handleClearLibrary = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider votre bibliothèque ? Cette action est irréversible.')) {
      clearLibrary();
      setLibraryGames([]);
      setStats(getLibraryStats());
    }
  };

  const handleExportLibrary = () => {
    const data = exportLibrary();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mijoumicou-bibliotheque-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportLibrary = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string;
          if (importLibrary(data)) {
            alert('Bibliothèque importée avec succès !');
            // Recharger les jeux
            const gameIds = getGameIds();
            const games = allGames.filter(game => gameIds.includes(game.id.toString()));
            setLibraryGames(games);
            setStats(getLibraryStats());
          } else {
            alert('Erreur lors de l\'importation. Vérifiez le format du fichier.');
          }
        } catch (error) {
          alert('Erreur lors de l\'importation. Fichier invalide.');
        }
      };
      reader.readAsText(file);
    }
  };

  const getTypeStats = () => {
    const typeCount: { [key: string]: number } = {};
    libraryGames.forEach(game => {
      typeCount[game.type_principal] = (typeCount[game.type_principal] || 0) + 1;
    });
    return Object.entries(typeCount).sort((a, b) => b[1] - a[1]);
  };

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
                <h2 className="text-2xl font-bold">Ma Bibliothèque</h2>
                <p className="text-blue-100">Gérez votre collection de jeux</p>
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
                <div className="text-2xl font-bold text-purple-600">{stats.totalGames}</div>
                <div className="text-sm text-gray-600">Jeux total</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{getTypeStats().length}</div>
                <div className="text-sm text-gray-600">Types différents</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {libraryGames.length > 0 ? Math.round(libraryGames.reduce((acc, game) => acc + game.duree_moyenne, 0) / libraryGames.length) : 0}
                </div>
                <div className="text-sm text-gray-600">Durée moyenne (min)</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {libraryGames.length > 0 ? Math.round(libraryGames.reduce((acc, game) => acc + game.complexite, 0) / libraryGames.length * 10) / 10 : 0}
                </div>
                <div className="text-sm text-gray-600">Complexité moyenne</div>
              </CardContent>
            </Card>
          </div>

          {/* Types de jeux */}
          {getTypeStats().length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Répartition par type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {getTypeStats().map(([type, count]) => (
                    <Badge key={type} variant="secondary" className="text-sm">
                      {type} ({count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Search size={20} className="text-gray-400" />
              <Input
                placeholder="Rechercher dans ma bibliothèque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleExportLibrary}
                variant="outline"
                size="sm"
                disabled={libraryGames.length === 0}
              >
                <Download size={16} className="mr-2" />
                Exporter
              </Button>
              
              <label className="cursor-pointer">
                <Button
                  variant="outline"
                  size="sm"
                  className="pointer-events-none"
                >
                  <Upload size={16} className="mr-2" />
                  Importer
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportLibrary}
                  className="hidden"
                />
              </label>
              
              <Button
                onClick={handleClearLibrary}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-50"
                disabled={libraryGames.length === 0}
              >
                <Trash2 size={16} className="mr-2" />
                Vider
              </Button>
            </div>
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
                  ? 'Ajoutez des jeux en cliquant sur "Ajouter à ma bibliothèque" sur les jeux qui vous intéressent !'
                  : 'Essayez de modifier votre recherche.'
                }
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

export default LibraryComponent;