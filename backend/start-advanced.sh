#!/bin/bash

echo "🎲 Society Games Helper - Système Avancé"
echo "========================================"

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Arrêter les processus existants sur le port 3001
echo "🔄 Arrêt des serveurs existants..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Démarrer le serveur avancé
echo "🚀 Démarrage du serveur avancé..."
echo "   Serveur : http://localhost:3001"
echo "   Santé   : http://localhost:3001/api/health"
echo "   Stats   : http://localhost:3001/api/stats"
echo ""
echo "📡 Endpoints disponibles :"
echo "   POST /api/recommend/advanced - Recommandations intelligentes"
echo "   POST /api/analyze/mood        - Analyse d'humeur seulement"
echo "   GET  /api/games               - Liste tous les jeux"
echo "   GET  /api/stats               - Statistiques de la base"
echo ""
echo "💡 Exemple de test :"
echo "   curl -X POST http://localhost:3001/api/recommend/advanced \\"
echo "        -H 'Content-Type: application/json' \\"
echo "        -d '{\"mood\": \"Je suis fatigué mais j'ai envie de rigoler\"}'"
echo ""
echo "🎯 Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

node server.js