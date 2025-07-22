const fs = require('fs');
const path = require('path');

// Charger directement les données JSON
const gamesData = require('../../api/games_data.json');

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

    // Calculs de compatibilité
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

exports.handler = async (event, context) => {
  // Configuration CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const { path, httpMethod, body } = event;
  
  try {
    console.log(`Netlify function called: ${httpMethod} ${path}`);

    // Route principale de recommandation
    if (path.includes('/recommend/advanced') && httpMethod === 'POST') {
      const { mood } = JSON.parse(body || '{}');
      
      if (!mood || typeof mood !== 'string' || mood.trim() === '') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Mood description is required' })
        };
      }

      // Easter egg pour Célia - vérifier AVANT tout calcul
      const easterEggPhrase = "Je cherche un jeu de MERDE qui ne plaît uniquement qu'à un gros CON";
      if (mood === easterEggPhrase) {
        const perudoGame = gamesData.find(game => game.nom === 'Perudo');
        if (perudoGame) {
          console.log('🥚 Easter egg détecté ! Retour de Perudo uniquement');
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              mood: mood,
              analysis: {
                detected_tags: ['easter egg', 'perudo', 'merde', 'con'],
                confidence_score: 100,
                energie_requise: 3.5,
                niveau_social: 4.5,
                facteur_chance: 4.0,
                tension_niveau: 3.5,
                complexite: 2.0,
                duree_moyenne: 30,
                courbe_apprentissage: 2.0,
                rejouabilite: 4.0,
                niveau_conflit: 3.0
              },
              recommendations: [perudoGame],
              explanations: [
                '🥚 Easter egg détecté !',
                '🎯 Perudo est LE jeu de MERDE parfait pour un gros CON !',
                '😄 Bravo d\'avoir trouvé ce message caché de Célia !',
                '🎪 L\'IA a un sens de l\'humeur... douteux mais efficace !'
              ]
            })
          };
        }
      }

      const analysis = analyzeMood(mood);
      const gamesWithScores = calculateCompatibilityScores(gamesData, analysis);
      const recommendations = selectDiverseRecommendations(gamesWithScores, 6);

      const explanations = [
        `🎯 Analyse: ${analysis.detected_tags.slice(0, 3).join(', ')}`,
        `🔍 Confiance: ${analysis.confidence_score}%`,
        `🏆 ${recommendations.length} jeux sélectionnés`
      ];

      if (recommendations.length > 0) {
        explanations.push(`🎮 Top: ${recommendations[0].nom} (${Math.round(recommendations[0].compatibility_score)}% compatible)`);
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          mood: mood,
          analysis: analysis,
          recommendations: recommendations,
          explanations: explanations
        })
      };
    }

    // Route pour obtenir tous les jeux
    if (path.includes('/games') && httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ games: gamesData })
      };
    }

    // Route pour les statistiques
    if (path.includes('/stats') && httpMethod === 'GET') {
      const stats = {
        total_games: gamesData.length,
        by_type: {},
        average_duration: gamesData.reduce((sum, game) => sum + game.duree_moyenne, 0) / gamesData.length
      };
      
      gamesData.forEach(game => {
        stats.by_type[game.type_principal] = (stats.by_type[game.type_principal] || 0) + 1;
      });
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(stats)
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found' })
    };
    
  } catch (error) {
    console.error('Netlify function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};