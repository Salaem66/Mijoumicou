const express = require('express');
const cors = require('cors');
const sharedApi = require('../shared/api');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration CORS détaillée
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: ['shared-api', 'easter-eggs', 'mood-analysis']
  });
});

// Endpoint pour obtenir tous les jeux
app.get('/api/games', (req, res) => {
  try {
    const games = sharedApi.getAllGames();
    res.json(games);
  } catch (error) {
    console.error('Erreur lors de la récupération des jeux:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint principal pour les recommandations avancées
app.post('/api/recommend/advanced', (req, res) => {
  try {
    const { mood, libraryOnly = false, gameIds = [] } = req.body;
    
    if (!mood || typeof mood !== 'string' || mood.trim() === '') {
      return res.status(400).json({ error: 'Mood description is required' });
    }

    console.log(`🧠 Analyse d'humeur: "${mood}"`);
    if (libraryOnly) {
      console.log(`📚 Recherche dans la bibliothèque: ${gameIds.length} jeux`);
    }

    // Utiliser l'API partagée pour la logique de recommandations
    const response = sharedApi.processRecommendations(mood.trim(), libraryOnly, gameIds);
    
    // Ajouter les métadonnées spécifiques au serveur local
    const allGames = sharedApi.getAllGames();
    let filteredCount = allGames.length;
    
    if (libraryOnly && gameIds.length > 0) {
      filteredCount = allGames.filter(game => gameIds.includes(game.id.toString())).length;
    }
    
    response.search_metadata = {
      total_games_analyzed: filteredCount,
      games_above_threshold: response.recommendations.length,
      analysis_confidence: response.mood_analysis.confidence_score,
      library_search: libraryOnly && gameIds.length > 0
    };

    console.log(`✅ ${response.recommendations.length} jeux recommandés`);
    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la recommandation avancée:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Endpoint pour l'analyse d'humeur uniquement
app.post('/api/analyze/mood', (req, res) => {
  try {
    const { mood } = req.body;
    
    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    const analysis = sharedApi.analyzeMood(mood);
    
    res.json({
      user_input: mood,
      analysis: analysis
    });
  } catch (error) {
    console.error('Erreur lors de l\'analyse d\'humeur:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour les statistiques
app.get('/api/stats', (req, res) => {
  try {
    const stats = sharedApi.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour obtenir les jeux par type
app.get('/api/games/type/:type', (req, res) => {
  try {
    const { type } = req.params;
    const games = sharedApi.getAllGames();
    const filteredGames = games.filter(game => 
      game.type_principal && game.type_principal.toLowerCase() === type.toLowerCase()
    );
    res.json(filteredGames);
  } catch (error) {
    console.error('Erreur lors du filtrage par type:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour rechercher par tags
app.post('/api/search/tags', (req, res) => {
  try {
    const { tags } = req.body;
    
    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags array is required' });
    }
    
    const games = sharedApi.getAllGames();
    const filteredGames = games.filter(game => {
      if (!game.tags_mood) return false;
      return tags.some(tag => 
        game.tags_mood.some(gameTag => 
          gameTag.toLowerCase().includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes(gameTag.toLowerCase())
        )
      );
    });
    
    res.json(filteredGames);
  } catch (error) {
    console.error('Erreur lors de la recherche par tags:', error);
    res.status(500).json({ error: error.message });
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur API démarré sur le port ${port}`);
  console.log(`📊 ${sharedApi.getAllGames().length} jeux chargés depuis l'API partagée`);
  console.log(`🎯 Endpoints disponibles:`);
  console.log(`   GET  /api/health           - Santé du serveur`);
  console.log(`   GET  /api/games            - Tous les jeux`);
  console.log(`   POST /api/recommend/advanced - Recommandations`);
  console.log(`   POST /api/analyze/mood     - Analyse d'humeur`);
  console.log(`   GET  /api/stats            - Statistiques`);
  console.log(`   GET  /api/games/type/:type - Jeux par type`);
  console.log(`   POST /api/search/tags      - Recherche par tags`);
  console.log(`\n🔗 Frontend: http://localhost:3000`);
  console.log(`📡 API: http://localhost:${port}/api`);
  
  if (sharedApi.isLocal) {
    console.log(`\n🏠 Mode local détecté - utilisation des données depuis backend/games_data.json`);
  }
});