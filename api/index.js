const fs = require('fs');
const path = require('path');

// Charger directement les données JSON (pas de SQLite sur Vercel)
const gamesData = require('./games_data.json');

// Analyseur d'humeur simplifié
const synonymDictionary = {
  'tranquille': { niveau_social: 2.0, energie_requise: 2.0 },
  'calme': { niveau_social: 2.0, energie_requise: 2.0 },
  'reposant': { tension_niveau: 1.5, energie_requise: 2.0 },
  'energique': { energie_requise: 4.5, niveau_social: 4.0 },
  'fun': { energie_requise: 4.0, niveau_social: 4.0, facteur_chance: 3.5 },
  'rigoler': { energie_requise: 4.0, niveau_social: 4.5, facteur_chance: 3.5 },
  'amis': { niveau_social: 4.5, joueurs_ideal: 4 },
  'famille': { niveau_social: 3.5, complexite: 2.5 },
  'simple': { complexite: 2.0, courbe_apprentissage: 2.0 },
  'complexe': { complexite: 4.0, courbe_apprentissage: 4.0 },
  'rapide': { duree_moyenne: 30 },
  'long': { duree_moyenne: 120 },
  'strategie': { complexite: 3.5, tension_niveau: 3.0 },
  'chance': { facteur_chance: 4.0, complexite: 2.0 },
  'bluff': { niveau_social: 4.0, tension_niveau: 3.5 },
  'cooperatif': { niveau_conflit: 1.5, niveau_social: 4.0 },
  'compétitif': { niveau_conflit: 4.0, tension_niveau: 3.5 },
  'nul': { energie_requise: 3.5, niveau_social: 4.5, facteur_chance: 4.0 },
  'con': { energie_requise: 3.5, niveau_social: 4.5, facteur_chance: 4.0 },
  'merde': { energie_requise: 3.5, niveau_social: 4.5, facteur_chance: 4.0 }
};

function analyzeMood(mood) {
  const moodLower = mood.toLowerCase();
  const detected_tags = [];
  let moodProfile = {
    energie_requise: 3.0,
    niveau_social: 3.0,
    facteur_chance: 3.0,
    tension_niveau: 3.0,
    complexite: 3.0,
    duree_moyenne: 60,
    courbe_apprentissage: 3.0,
    rejouabilite: 3.0,
    niveau_conflit: 3.0
  };

  for (const [keyword, values] of Object.entries(synonymDictionary)) {
    if (moodLower.includes(keyword)) {
      detected_tags.push(keyword);
      Object.assign(moodProfile, values);
    }
  }

  return {
    detected_tags: detected_tags.length > 0 ? detected_tags : ['neutre'],
    confidence_score: detected_tags.length > 0 ? 85 : 50,
    mood_profile: moodProfile
  };
}

function calculateCompatibilityScores(games, analysis) {
  return games.map(game => {
    const profile = analysis.mood_profile;
    let score = 0;

    // Calculs de compatibilité basés sur les critères
    score += Math.max(0, 100 - Math.abs(game.energie_requise - profile.energie_requise) * 15);
    score += Math.max(0, 100 - Math.abs(game.niveau_social - profile.niveau_social) * 15);
    score += Math.max(0, 100 - Math.abs(game.facteur_chance - profile.facteur_chance) * 10);
    score += Math.max(0, 100 - Math.abs(game.tension_niveau - profile.tension_niveau) * 10);
    score += Math.max(0, 100 - Math.abs(game.complexite - profile.complexite) * 10);

    // Bonus pour les tags correspondants
    if (game.tags_mood) {
      const matchingTags = analysis.detected_tags.filter(tag => 
        game.tags_mood.some(gameTag => gameTag.includes(tag) || tag.includes(gameTag))
      );
      score += matchingTags.length * 20;
    }

    return {
      ...game,
      compatibility_score: Math.min(100, Math.max(0, score / 5))
    };
  });
}

function selectDiverseRecommendations(gamesWithScores, count = 6) {
  const eligibleGames = gamesWithScores
    .filter(game => game.compatibility_score > 15)
    .sort((a, b) => b.compatibility_score - a.compatibility_score);

  return eligibleGames.slice(0, count);
}

// Fonction principale Vercel
module.exports = async (req, res) => {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;
  
  try {
    console.log(`API appelée: ${method} ${url}`);
    
    // Route principale de recommandation
    if (url.includes('/api/recommend/advanced') && method === 'POST') {
      const { mood } = req.body;
      
      if (!mood || typeof mood !== 'string' || mood.trim() === '') {
        return res.status(400).json({ error: 'Mood description is required' });
      }

      console.log(`Analyse d'humeur pour: "${mood}"`);
      const analysis = analyzeMood(mood);
      const gamesWithScores = calculateCompatibilityScores(gamesData, analysis);
      const recommendations = selectDiverseRecommendations(gamesWithScores, 6);
      
      console.log(`${recommendations.length} recommandations trouvées`);

      // Easter egg pour Célia
      const easterEggPhrase = "Je cherche un jeu de MERDE qui ne plaît uniquement qu'à un gros CON";
      if (mood === easterEggPhrase) {
        const perudoGame = recommendations.find(game => game.nom === 'Perudo');
        if (perudoGame) {
          console.log('Easter egg Célia détecté !');
          return res.json({
            mood: mood,
            analysis: {
              ...analysis,
              detected_tags: ['easter egg', 'perudo', 'merde', 'con'],
              confidence_score: 100
            },
            recommendations: [perudoGame],
            explanations: [
              '🥚 Easter egg détecté !',
              '🎯 Perudo est LE jeu de MERDE parfait pour un gros CON !',
              '😄 Bravo d\'avoir trouvé ce message caché de Célia !',
              '🎪 L\'IA a un sens de l\'humeur... douteux mais efficace !'
            ]
          });
        }
      }

      const explanations = [
        `🎯 Analyse: ${analysis.detected_tags.slice(0, 3).join(', ')}`,
        `🔍 Confiance: ${analysis.confidence_score}%`,
        `🏆 ${recommendations.length} jeux sélectionnés`
      ];

      if (recommendations.length > 0) {
        explanations.push(`🎮 Top: ${recommendations[0].nom} (${Math.round(recommendations[0].compatibility_score)}% compatible)`);
      }
      
      return res.json({
        mood: mood,
        analysis: analysis,
        recommendations: recommendations,
        explanations: explanations
      });
    }

    // Route d'analyse de mood uniquement
    if (url.includes('/api/analyze/mood') && method === 'POST') {
      const { mood } = req.body;
      const analysis = analyzeMood(mood);
      return res.json({ analysis });
    }

    // Route pour obtenir tous les jeux
    if (url.includes('/api/games') && method === 'GET') {
      console.log(`Retour de ${gamesData.length} jeux`);
      return res.json({ games: gamesData });
    }

    // Route pour les statistiques
    if (url.includes('/api/stats') && method === 'GET') {
      const stats = {
        total_games: gamesData.length,
        by_type: {},
        average_duration: gamesData.reduce((sum, game) => sum + game.duree_moyenne, 0) / gamesData.length
      };
      
      gamesData.forEach(game => {
        stats.by_type[game.type_principal] = (stats.by_type[game.type_principal] || 0) + 1;
      });
      
      return res.json(stats);
    }

    // Test de santé
    if (url.includes('/api/health') && method === 'GET') {
      return res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        games_loaded: gamesData.length
      });
    }

    // Route par défaut
    console.log(`Route non trouvée: ${method} ${url}`);
    return res.status(404).json({ error: 'Route not found' });
    
  } catch (error) {
    console.error('Erreur API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};