import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Brain, Heart, Clock, Users, Zap, Target, Library } from 'lucide-react';
import { MoodAnalysis } from '../types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useLibrary } from '../services/library';

interface MoodAnalyzerProps {
  onAnalyze: (mood: string, searchInLibrary?: boolean) => void;
  loading: boolean;
  analysis?: MoodAnalysis;
  error?: string | null;
}

const MoodAnalyzer: React.FC<MoodAnalyzerProps> = ({ onAnalyze, loading, analysis, error }) => {
  const [mood, setMood] = useState('');
  const [focused, setFocused] = useState(false);
  const [searchInLibrary, setSearchInLibrary] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getGameCount } = useLibrary();

  const exampleMoods = [
    "Je suis fatigué mais j'ai envie de rigoler avec mes amis",
    "Grosse soirée jeux entre potes",
    "Apéro décontracté en couple"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood.trim() && !loading) {
      onAnalyze(mood.trim(), searchInLibrary);
    }
  };

  const handleExampleClick = (example: string) => {
    setMood(example);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleDoubleClick = () => {
    // Permettre de vider le texte avec un double-clic
    setMood('');
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  };

  const handleClick = () => {
    // Si c'est le texte spécial de la démo Célia, le supprimer au premier clic
    const celiaText = "Je cherche un jeu de MERDE qui ne plaît uniquement qu'à un gros CON";
    if (mood === celiaText) {
      console.log('🎪 Suppression du texte de démo au clic');
      setMood('');
      // Nettoyer le texte préservé dans la fenêtre
      delete (window as any).celiaPreservedText;
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [mood]);

  const getAnalysisIcon = (category: string) => {
    switch (category) {
      case 'energie': return <Zap size={16} className="text-yellow-500" />;
      case 'social': return <Users size={16} className="text-blue-500" />;
      case 'duree': return <Clock size={16} className="text-green-500" />;
      case 'complexite': return <Brain size={16} className="text-purple-500" />;
      default: return <Target size={16} className="text-gray-500" />;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Formulaire principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${
          focused ? 'border-purple-300 shadow-xl' : 'border-gray-200'
        }`}>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Brain size={20} className="text-white" />
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <label htmlFor="mood" className="block text-lg font-semibold text-gray-900 mb-2">
                    Comment vous sentez-vous aujourd'hui ?
                  </label>
                  <Textarea
                    ref={textareaRef}
                    id="mood"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onClick={handleClick}
                    onDoubleClick={handleDoubleClick}
                    placeholder="Décrivez votre humeur, vos envies, votre contexte... Plus vous êtes précis, meilleures seront les recommandations ! (Clic pour effacer le texte de démo)"
                    className="resize-none min-h-[80px]"
                    rows={3}
                    disabled={loading}
                    title="Cliquez pour effacer le texte de démo, double-cliquez pour effacer tout texte"
                  />
                </div>
                
                {/* Option de recherche dans la bibliothèque */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="searchInLibrary"
                      checked={searchInLibrary}
                      onChange={(e) => setSearchInLibrary(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                      disabled={loading}
                    />
                    <label htmlFor="searchInLibrary" className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                      <Library size={16} className="mr-1 text-purple-600" />
                      Chercher uniquement dans ma bibliothèque
                      <span className="ml-1 text-xs text-gray-500">
                        ({getGameCount()} jeu{getGameCount() > 1 ? 'x' : ''})
                      </span>
                    </label>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={loading || !mood.trim() || (searchInLibrary && getGameCount() === 0)}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium shadow-lg"
                    >
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mr-2"
                          >
                            <Sparkles size={18} />
                          </motion.div>
                          <span>Analyse en cours...</span>
                        </>
                      ) : (
                        <>
                          {searchInLibrary ? <Library size={18} className="mr-2" /> : <Send size={18} className="mr-2" />}
                          <span>{searchInLibrary ? 'Analyser ma bibliothèque' : 'Analyser mon humeur'}</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Exemples */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <h3 className="text-sm font-medium text-gray-700 mb-3">💡 Exemples d'humeurs :</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            {exampleMoods.map((example, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  onClick={() => handleExampleClick(example)}
                  className="flex-1 p-3 h-auto text-left bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 transition-all duration-200 hover:border-purple-300 whitespace-normal"
                  disabled={loading}
                >
                  "{example}"
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Erreur */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Résultats de l'analyse */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8"
          >
            <Card className="shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Heart size={20} className="text-purple-600" />
                    <span>Analyse de votre humeur</span>
                  </CardTitle>
                  <Badge className={`${getConfidenceColor(analysis.confidence_score)}`}>
                    Confiance : {analysis.confidence_score}%
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Humeurs détectées */}
                {analysis.detected_moods && analysis.detected_moods.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Humeurs détectées :</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.detected_moods.map((mood, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                        >
                          {mood}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags détectés */}
                {analysis.detected_tags && analysis.detected_tags.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Expressions reconnues :</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.detected_tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Métriques analysées */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  {getAnalysisIcon('energie')}
                  <div className="text-xs text-gray-600 mt-1">Énergie souhaitée</div>
                  <div className="text-lg font-bold text-gray-900">{analysis.energie_requise.toFixed(1)}/5</div>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  {getAnalysisIcon('social')}
                  <div className="text-xs text-gray-600 mt-1">Interaction sociale</div>
                  <div className="text-lg font-bold text-gray-900">{analysis.niveau_social.toFixed(1)}/5</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                  {getAnalysisIcon('duree')}
                  <div className="text-xs text-gray-600 mt-1">Durée idéale</div>
                  <div className="text-lg font-bold text-gray-900">{analysis.duree_moyenne}min</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                  {getAnalysisIcon('complexite')}
                  <div className="text-xs text-gray-600 mt-1">Complexité</div>
                  <div className="text-lg font-bold text-gray-900">{analysis.complexite.toFixed(1)}/5</div>
                </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoodAnalyzer;