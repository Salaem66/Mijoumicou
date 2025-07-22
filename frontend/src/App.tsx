import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, TrendingUp, Clock, Library, Grid, Plus } from 'lucide-react';
import StartPage from './components/StartPage';
import MoodAnalyzer from './components/MoodAnalyzer';
import GameCard from './components/GameCard';
import GameModal from './components/GameModal';
import LibraryComponent from './components/Library';
import AllGames from './components/AllGames';
import AddGameForm from './components/AddGameForm';
import { apiService } from './services/api';
import { RecommendationResponse, Game } from './types';
import { Button } from './components/ui/button';
import { useLibrary } from './services/library';
import './App.css';

function App() {
  const [showStartPage, setShowStartPage] = useState(true);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [activeModalGame, setActiveModalGame] = useState<Game | null>(null);
  const [modalOrigin, setModalOrigin] = useState<{ x: number; y: number } | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showAllGames, setShowAllGames] = useState(false);
  const [showAddGame, setShowAddGame] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { getGameCount, getGameIds } = useLibrary();

  useEffect(() => {
    // Charger les statistiques et tous les jeux au démarrage
    const loadInitialData = async () => {
      try {
        const [statsData, gamesData] = await Promise.all([
          apiService.getStats(),
          apiService.getAllGames()
        ]);
        setStats(statsData);
        setAllGames(gamesData);
      } catch (err) {
        console.error('Erreur lors du chargement des données initiales:', err);
      }
    };

    loadInitialData();

    // Pas besoin de listener complexe, la démo utilise maintenant le callback direct
  }, []);

  const handleMoodAnalysis = async (mood: string, searchInLibrary: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const libraryIds = getGameIds();
      console.log('🔍 Recherche dans la bibliothèque:', searchInLibrary);
      console.log('📚 Jeux dans la bibliothèque:', libraryIds);
      console.log('📊 Nombre de jeux dans la bibliothèque:', libraryIds.length);
      
      // Vérifier si la bibliothèque est vide lors d'une recherche dans la bibliothèque
      if (searchInLibrary && libraryIds.length === 0) {
        setError('Votre bibliothèque est vide. Ajoutez des jeux à votre bibliothèque pour utiliser cette fonctionnalité.');
        return;
      }
      
      // Utiliser la nouvelle API avec support natif de la bibliothèque
      const response = await apiService.getRecommendations(
        mood, 
        searchInLibrary, 
        searchInLibrary ? libraryIds : []
      );
      
      console.log('🎯 Recommandations reçues:', response.recommendations.length);
      if (searchInLibrary) {
        console.log('🔍 Mode bibliothèque activé - Jeux recommandés:', response.recommendations.map(r => r.nom));
      }
      setRecommendations(response);
      
      // Scroll automatique vers les résultats après un court délai
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const resetRecommendations = () => {
    setRecommendations(null);
    setError(null);
  };

  const handleOpenModal = (game: Game, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const cardElement = event.currentTarget.closest('.game-card');
    
    if (cardElement) {
      const cardRect = cardElement.getBoundingClientRect();
      setModalOrigin({
        x: cardRect.left + cardRect.width / 2,
        y: cardRect.top + cardRect.height / 2
      });
    } else {
      setModalOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }
    
    setActiveModalGame(game);
  };

  const handleCloseModal = () => {
    setActiveModalGame(null);
    setModalOrigin(null);
  };

  const handleStartApp = () => {
    setShowStartPage(false);
  };

  const handleCeliaDemo = async (mood: string) => {
    console.log('🎪 Démo Célia déclenchée avec:', mood);
    // Déclencher l'analyse normale avec le texte de Célia, sans préservation du texte
    await handleMoodAnalysis(mood, false);
  };

  const handleGameAdded = (newGame: Game) => {
    // Rafraîchir la liste des jeux
    setAllGames(prev => [...prev, newGame]);
    
    // Afficher un message de succès
    console.log('Nouveau jeu ajouté:', newGame.nom);
  };

  return (
    <AnimatePresence mode="wait">
      {showStartPage ? (
        <motion.div
          key="start-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <StartPage onStart={handleStartApp} onCeliaDemo={handleCeliaDemo} />
        </motion.div>
      ) : (
        <motion.div
          key="main-app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100"
        >
      {/* Header */}
      <header className="relative overflow-hidden bg-white shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-10"></div>
        
        {/* Boutons de navigation */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowAllGames(true)}
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Grid size={16} className="mr-2" />
              Tous les jeux
            </Button>
            
            <Button
              onClick={() => setShowAddGame(true)}
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-green-200 text-green-700 hover:bg-green-50"
            >
              <Plus size={16} className="mr-2" />
              Ajouter un jeu
            </Button>
            <Button
              onClick={() => setShowLibrary(true)}
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Library size={16} className="mr-2" />
              Ma bibliothèque ({getGameCount()})
            </Button>
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center space-x-3 mb-4"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
                <Sparkles size={24} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Mijoumicou
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Découvrez le jeu parfait grâce à l'intelligence artificielle. 
              Décrivez votre humeur, nous trouvons les jeux qui vous correspondent.
            </motion.p>

            {/* Stats rapides */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-600"
              >
                <div className="flex items-center space-x-2">
                  <BookOpen size={16} />
                  <span>{stats.total_games} jeux en base</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{stats.average_duration}min en moyenne</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp size={16} />
                  <span>IA avancée</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Analyseur d'humeur */}
        <div className="mb-12">
          <MoodAnalyzer
            onAnalyze={handleMoodAnalysis}
            loading={loading}
            analysis={recommendations?.mood_analysis}
            error={error}
          />
        </div>

        {/* Résultats des recommandations */}
        <AnimatePresence>
          {recommendations && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Recommandations */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Jeux recommandés pour vous
                  </h2>
                  <Button
                    onClick={resetRecommendations}
                    variant="ghost"
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Nouvelle recherche
                  </Button>
                </div>

                {recommendations.recommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucune recommandation trouvée
                    </h3>
                    <p className="text-gray-600">
                      Essayez de reformuler votre humeur ou d'être plus spécifique.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.recommendations.map((game, index) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        rank={index + 1}
                        showCompatibility={true}
                        onOpenModal={handleOpenModal}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Métadonnées de recherche */}
              {recommendations.search_metadata && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Détails de l'analyse</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Jeux analysés :</span>
                      <span className="ml-2 font-semibold">{recommendations.search_metadata.total_games_analyzed}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Compatibles :</span>
                      <span className="ml-2 font-semibold">{recommendations.search_metadata.games_above_threshold}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Confiance :</span>
                      <span className="ml-2 font-semibold">{recommendations.search_metadata.analysis_confidence}%</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section de découverte quand pas de recommandations */}
        {!recommendations && !loading && allGames.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Découvrez notre collection
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explorez quelques-uns de nos jeux populaires en attendant de décrire votre humeur.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allGames.slice(0, 6).map((game) => (
                <GameCard key={game.id} game={game} onOpenModal={handleOpenModal} />
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Et bien plus encore... Décrivez votre humeur pour des recommandations personnalisées !
              </p>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              Créé avec ❤️ par Mijoumicou pour des soirées jeux parfaites
            </p>
            <p className="text-sm">
              Mijoumicou - Système avancé d'analyse d'humeur et de recommandation par intelligence artificielle
            </p>
          </div>
        </div>
      </footer>

          {/* Modale globale */}
          <GameModal
            game={activeModalGame}
            isOpen={!!activeModalGame}
            onClose={handleCloseModal}
            origin={modalOrigin}
          />

          {/* Bibliothèque */}
          <AnimatePresence>
            {showLibrary && (
              <LibraryComponent
                allGames={allGames}
                onClose={() => setShowLibrary(false)}
                onOpenGameModal={handleOpenModal}
              />
            )}
          </AnimatePresence>

          {/* Tous les jeux */}
          <AnimatePresence>
            {showAllGames && (
              <AllGames
                allGames={allGames}
                onClose={() => setShowAllGames(false)}
                onOpenGameModal={handleOpenModal}
              />
            )}
          </AnimatePresence>

          {/* Ajouter un jeu */}
          <AnimatePresence>
            {showAddGame && (
              <AddGameForm
                onClose={() => setShowAddGame(false)}
                onGameAdded={handleGameAdded}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;