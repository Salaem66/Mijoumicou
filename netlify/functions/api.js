// Utiliser l'API partagée
process.env.NODE_ENV = 'netlify';
const sharedApi = require('../../shared/api');

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
      const { mood, libraryOnly = false, gameIds = [] } = JSON.parse(body || '{}');
      
      if (!mood || typeof mood !== 'string' || mood.trim() === '') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Mood description is required' })
        };
      }

      console.log(`🧠 Netlify - Analyse d'humeur: "${mood}"`);

      // Utiliser l'API partagée pour la logique de recommandations
      const response = sharedApi.processRecommendations(mood.trim(), libraryOnly, gameIds);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response)
      };
    }

    // Route pour obtenir tous les jeux
    if (path.includes('/games') && httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ games: sharedApi.getAllGames() })
      };
    }

    // Route pour les statistiques
    if (path.includes('/stats') && httpMethod === 'GET') {
      const stats = sharedApi.getStats();
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