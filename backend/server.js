const express = require('express');
const cors = require('cors');
const AdvancedDatabase = require('./database');
const AdvancedMoodAnalyzer = require('./moodAnalyzer');

const app = express();
const port = 3001;

const db = new AdvancedDatabase();
const moodAnalyzer = new AdvancedMoodAnalyzer();

app.use(cors());
app.use(express.json());

// Fonction pour sélectionner des recommandations diverses
function selectDiverseRecommendations(gamesWithScores, count = 6) {
  // Filtrer les jeux avec un score minimal
  const eligibleGames = gamesWithScores
    .filter(game => game.compatibility_score > 15) // Seuil plus bas pour plus de diversité
    .sort((a, b) => b.compatibility_score - a.compatibility_score);

  if (eligibleGames.length === 0) {
    return [];
  }

  // Supprimer les doublons par nom
  const uniqueGames = [];
  const seenNames = new Set();
  
  for (const game of eligibleGames) {
    if (!seenNames.has(game.nom)) {
      uniqueGames.push(game);
      seenNames.add(game.nom);
    }
  }

  // Sélection diverse par types et complexité
  const recommendations = [];
  const usedTypes = new Set();
  const complexityRanges = new Set();

  // Premier passage : prendre les meilleurs de chaque type
  for (const game of uniqueGames) {
    if (recommendations.length >= count) break;
    
    const complexityRange = getComplexityRange(game.complexite);
    const typeComplexKey = `${game.type_principal}_${complexityRange}`;
    
    if (!usedTypes.has(typeComplexKey)) {
      recommendations.push(game);
      usedTypes.add(typeComplexKey);
      complexityRanges.add(complexityRange);
    }
  }

  // Deuxième passage : compléter avec les meilleurs scores restants
  for (const game of uniqueGames) {
    if (recommendations.length >= count) break;
    
    if (!recommendations.find(r => r.nom === game.nom)) {
      recommendations.push(game);
    }
  }

  // Troisième passage : s'assurer d'avoir une gamme de complexité
  if (recommendations.length < count) {
    const remainingGames = uniqueGames.filter(
      game => !recommendations.find(r => r.nom === game.nom)
    );
    
    // Prioriser les jeux avec des complexités manquantes
    const missingComplexities = ['simple', 'moyen', 'complexe'].filter(
      comp => !Array.from(complexityRanges).includes(comp)
    );
    
    for (const complexity of missingComplexities) {
      const gameOfComplexity = remainingGames.find(
        game => getComplexityRange(game.complexite) === complexity
      );
      if (gameOfComplexity && recommendations.length < count) {
        recommendations.push(gameOfComplexity);
      }
    }
  }

  return recommendations.slice(0, count);
}

function getComplexityRange(complexity) {
  if (complexity <= 2) return 'simple';
  if (complexity <= 3.5) return 'moyen';
  return 'complexe';
}

// Endpoint pour obtenir tous les jeux
app.get('/api/games', async (req, res) => {
  try {
    const games = await db.getAllGames();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint principal pour les recommandations avancées
app.post('/api/recommend/advanced', async (req, res) => {
  try {
    const { mood, libraryOnly = false, gameIds = [] } = req.body;
    
    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    // Analyse de l'humeur
    const analysis = moodAnalyzer.analyzeMood(mood);
    
    // Récupération de tous les jeux
    let games = await db.getAllGames();
    
    // Si recherche uniquement dans la bibliothèque
    if (libraryOnly && gameIds.length > 0) {
      console.log('🔍 Filtrage par bibliothèque - IDs reçus:', gameIds);
      games = games.filter(game => gameIds.includes(game.id.toString()));
      console.log('📚 Jeux filtrés:', games.length, 'jeux trouvés');
    }
    
    // Calcul des scores de compatibilité pour chaque jeu
    const gamesWithScores = games.map(game => {
      const compatibility = moodAnalyzer.calculateGameCompatibility(analysis, game);
      return {
        ...game,
        compatibility_score: compatibility.score,
        match_explanations: compatibility.explanations,
        compatibility_details: compatibility.compatibility_details
      };
    });

    // Amélioration de l'algorithme de sélection
    const recommendations = selectDiverseRecommendations(gamesWithScores, 6);

    // Ajout d'explications globales
    const globalExplanations = generateGlobalExplanations(analysis, recommendations);

    res.json({
      user_input: mood,
      mood_analysis: analysis,
      recommendations,
      global_explanations: globalExplanations,
      search_metadata: {
        total_games_analyzed: games.length,
        games_above_threshold: gamesWithScores.filter(g => g.compatibility_score > 20).length,
        analysis_confidence: analysis.confidence_score,
        library_only: libraryOnly,
        library_games_count: libraryOnly ? gameIds.length : 0
      }
    });
  } catch (error) {
    console.error('Error in advanced recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour rechercher par tags spécifiques
app.post('/api/search/tags', async (req, res) => {
  try {
    const { tags } = req.body;
    
    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags array is required' });
    }

    const games = await db.searchByTags(tags);
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour rechercher par type de jeu
app.get('/api/games/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const games = await db.getGamesByType(type);
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour rechercher par contexte
app.get('/api/games/context/:context', async (req, res) => {
  try {
    const { context } = req.params;
    const games = await db.getGamesByContext(context);
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour analyser seulement l'humeur (sans recommandations)
app.post('/api/analyze/mood', async (req, res) => {
  try {
    const { mood } = req.body;
    
    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    const analysis = moodAnalyzer.analyzeMood(mood);
    res.json({
      user_input: mood,
      analysis
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour obtenir des jeux similaires
app.get('/api/games/:id/similar', async (req, res) => {
  try {
    const games = await db.getAllGames();
    const targetGame = games.find(g => g.id == req.params.id);
    
    if (!targetGame) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Recherche de jeux similaires basée sur les critères
    const similarGames = games
      .filter(game => game.id !== targetGame.id)
      .map(game => {
        let similarity = 0;
        
        // Similarité par type
        if (game.type_principal === targetGame.type_principal) similarity += 20;
        
        // Similarité par complexité
        const complexityDiff = Math.abs(game.complexite - targetGame.complexite);
        similarity += Math.max(0, (2 - complexityDiff) * 10);
        
        // Similarité par durée
        const durationDiff = Math.abs(game.duree_moyenne - targetGame.duree_moyenne);
        similarity += Math.max(0, (60 - durationDiff) / 3);
        
        // Similarité par mécaniques communes
        const commonMechanics = game.mecaniques.filter(m => targetGame.mecaniques.includes(m));
        similarity += commonMechanics.length * 5;
        
        return { ...game, similarity_score: Math.round(similarity) };
      })
      .filter(game => game.similarity_score > 15)
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, 5);

    res.json({
      target_game: targetGame,
      similar_games: similarGames
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '2.0',
    features: ['advanced_mood_analysis', 'explanation_engine', 'smart_scoring']
  });
});

// Endpoint pour obtenir les statistiques de la base de données
app.get('/api/stats', async (req, res) => {
  try {
    const games = await db.getAllGames();
    
    const stats = {
      total_games: games.length,
      by_type: {},
      by_complexity: {},
      average_duration: 0,
      complexity_range: { min: 5, max: 0 },
      duration_range: { min: 1000, max: 0 }
    };

    games.forEach(game => {
      // Stats par type
      stats.by_type[game.type_principal] = (stats.by_type[game.type_principal] || 0) + 1;
      
      // Stats par complexité
      const complexityLevel = Math.floor(game.complexite);
      stats.by_complexity[complexityLevel] = (stats.by_complexity[complexityLevel] || 0) + 1;
      
      // Moyennes et ranges
      stats.average_duration += game.duree_moyenne;
      stats.complexity_range.min = Math.min(stats.complexity_range.min, game.complexite);
      stats.complexity_range.max = Math.max(stats.complexity_range.max, game.complexite);
      stats.duration_range.min = Math.min(stats.duration_range.min, game.duree_moyenne);
      stats.duration_range.max = Math.max(stats.duration_range.max, game.duree_moyenne);
    });

    stats.average_duration = Math.round(stats.average_duration / games.length);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fonction utilitaire pour générer des explications globales
function generateGlobalExplanations(analysis, recommendations) {
  const explanations = [];

  if (analysis.confidence_score < 30) {
    explanations.push("⚠️ Analyse basée sur peu d'éléments. N'hésitez pas à être plus précis sur votre humeur !");
  }

  if (recommendations.length === 0) {
    explanations.push("😕 Aucun jeu ne correspond parfaitement à vos critères. Essayez de reformuler ou d'être moins spécifique.");
    return explanations;
  }

  if (analysis.energie_requise <= 2) {
    explanations.push("😴 Vous semblez rechercher des jeux relaxants et peu énergivores.");
  } else if (analysis.energie_requise >= 4) {
    explanations.push("⚡ Vous avez l'air d'être en forme pour des jeux dynamiques !");
  }

  if (analysis.niveau_social >= 4) {
    explanations.push("👥 Parfait pour créer de l'interaction et des discussions.");
  } else if (analysis.niveau_social <= 2) {
    explanations.push("🤔 Des jeux qui laissent de l'espace pour réfléchir tranquillement.");
  }

  if (analysis.duree_max <= 30) {
    explanations.push("⏰ Sélection de jeux courts adaptés à votre contrainte de temps.");
  } else if (analysis.duree_min >= 90) {
    explanations.push("⏳ Des jeux qui vous occuperont pour une longue session !");
  }

  if (analysis.detected_tags.length > 0) {
    explanations.push(`🎯 Correspondance trouvée pour : ${analysis.detected_tags.slice(0, 3).join(', ')}`);
  }

  const avgScore = recommendations.reduce((sum, game) => sum + game.compatibility_score, 0) / recommendations.length;
  if (avgScore >= 70) {
    explanations.push("🎯 Excellente correspondance ! Ces jeux devraient parfaitement vous convenir.");
  } else if (avgScore >= 50) {
    explanations.push("👍 Bonne correspondance générale avec quelques compromis.");
  } else {
    explanations.push("💡 Correspondance partielle. Ces jeux pourraient vous surprendre !");
  }

  return explanations;
}

app.listen(port, () => {
  console.log(`Advanced Society Games Server running on http://localhost:${port}`);
  console.log('Features: Advanced mood analysis, Smart scoring, Explanation engine');
});