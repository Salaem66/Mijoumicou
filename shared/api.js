const fs = require('fs');
const path = require('path');

// Configuration flexible pour les chemins selon l'environnement
const isNetlify = process.env.NETLIFY || process.env.NODE_ENV === 'netlify';
const isLocal = !isNetlify;

let gamesData;

// Fonction pour convertir les nombres décimaux en entiers
function convertToIntegers(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertToIntegers);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = convertToIntegers(value);
    }
    return newObj;
  } else if (typeof obj === 'number' && !Number.isInteger(obj)) {
    return Math.round(obj);
  }
  return obj;
}

// Charger les données selon l'environnement
if (isNetlify) {
  // Pour Netlify, charger directement le JSON
  gamesData = convertToIntegers(require('../api/games_data.json'));
} else {
  // Pour local, charger depuis le dossier backend
  const gamesPath = path.join(__dirname, '../backend/games_data.json');
  gamesData = convertToIntegers(JSON.parse(fs.readFileSync(gamesPath, 'utf8')));
}

// Analyseur d'humeur simplifié (nombres entiers uniquement)
const synonymDictionary = {
  'tranquille': { niveau_social: 2, energie_requise: 2 },
  'calme': { niveau_social: 2, energie_requise: 2 },
  'reposant': { tension_niveau: 2, energie_requise: 2 },
  'energique': { energie_requise: 5, niveau_social: 4 },
  'fun': { energie_requise: 4, niveau_social: 4, facteur_chance: 4 },
  'rigoler': { energie_requise: 4, niveau_social: 5, facteur_chance: 4 },
  'amis': { niveau_social: 5, joueurs_ideal: 4 },
  'famille': { niveau_social: 4, complexite: 3 },
  'simple': { complexite: 2, courbe_apprentissage: 2 },
  'complexe': { complexite: 4, courbe_apprentissage: 4 },
  'rapide': { duree_moyenne: 30 },
  'long': { duree_moyenne: 120 },
  'strategie': { complexite: 4, tension_niveau: 3 },
  'chance': { facteur_chance: 4, complexite: 2 },
  'bluff': { niveau_social: 4, tension_niveau: 4 },
  'cooperatif': { niveau_conflit: 2, niveau_social: 4 },
  'compétitif': { niveau_conflit: 4, tension_niveau: 4 },
  'nul': { energie_requise: 4, niveau_social: 5, facteur_chance: 4 },
  'con': { energie_requise: 4, niveau_social: 5, facteur_chance: 4 },
  'merde': { energie_requise: 4, niveau_social: 5, facteur_chance: 4 }
};

function analyzeMood(mood) {
  const moodLower = mood.toLowerCase();
  const detected_tags = [];
  let moodProfile = {
    energie_requise: 3,
    niveau_social: 3,
    facteur_chance: 3,
    tension_niveau: 3,
    complexite: 3,
    duree_moyenne: 60,
    courbe_apprentissage: 3,
    rejouabilite: 3,
    niveau_conflit: 3
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
      compatibility_score: Math.round(Math.min(100, Math.max(0, score / 5)))
    };
  });
}

function selectDiverseRecommendations(gamesWithScores, count = 6) {
  const eligibleGames = gamesWithScores
    .filter(game => game.compatibility_score > 15)
    .sort((a, b) => b.compatibility_score - a.compatibility_score);

  return eligibleGames.slice(0, count);
}

// Fonction principale de traitement des recommandations
function processRecommendations(mood, libraryOnly = false, gameIds = []) {
  // Easter egg pour Célia - vérifier AVANT tout calcul
  const easterEggPhrase = "Je cherche un jeu de MERDE qui ne plaît uniquement qu'à un gros CON";
  if (mood === easterEggPhrase) {
    const perudoGame = gamesData.find(game => game.nom === 'Perudo');
    if (perudoGame) {
      console.log('🥚 Easter egg détecté ! Retour de Perudo uniquement');
      return {
        mood: mood,
        mood_analysis: {
          detected_tags: ['easter egg', 'perudo', 'merde', 'con'],
          confidence_score: 100,
          energie_requise: 4,
          niveau_social: 5,
          facteur_chance: 4,
          tension_niveau: 4,
          complexite: 2,
          duree_moyenne: 30,
          courbe_apprentissage: 2,
          rejouabilite: 4,
          niveau_conflit: 3
        },
        recommendations: [perudoGame],
        explanations: [
          '🥚 Easter egg détecté !',
          '🎯 Perudo est LE jeu de MERDE parfait pour un gros CON !',
          '😄 Bravo d\'avoir trouvé ce message caché de Célia !',
          '🎪 L\'IA a un sens de l\'humeur... douteux mais efficace !'
        ]
      };
    }
  }

  const analysis = analyzeMood(mood);
  let games = [...gamesData];

  // Filtrage par bibliothèque si demandé
  if (libraryOnly && gameIds.length > 0) {
    games = games.filter(game => gameIds.includes(game.id.toString()));
  }

  const gamesWithScores = calculateCompatibilityScores(games, analysis);
  const recommendations = selectDiverseRecommendations(gamesWithScores, 6);
  
  const explanations = [
    `🎯 Analyse: ${analysis.detected_tags.slice(0, 3).join(', ')}`,
    `🔍 Confiance: ${analysis.confidence_score}%`,
    `🏆 ${recommendations.length} jeux sélectionnés`
  ];

  if (recommendations.length > 0) {
    explanations.push(`🎮 Top: ${recommendations[0].nom} (${recommendations[0].compatibility_score}% compatible)`);
  }
  
  return {
    mood: mood,
    mood_analysis: analysis,
    analysis: analysis, // Compatibilité avec l'ancien format
    recommendations: recommendations,
    explanations: explanations
  };
}

// Fonction pour obtenir les statistiques
function getStats() {
  const stats = {
    total_games: gamesData.length,
    by_type: {},
    average_duration: Math.round(gamesData.reduce((sum, game) => sum + game.duree_moyenne, 0) / gamesData.length)
  };
  
  gamesData.forEach(game => {
    stats.by_type[game.type_principal] = (stats.by_type[game.type_principal] || 0) + 1;
  });
  
  return stats;
}

// Fonction pour obtenir tous les jeux
function getAllGames() {
  return gamesData;
}

module.exports = {
  processRecommendations,
  getStats,
  getAllGames,
  analyzeMood,
  isNetlify,
  isLocal
};