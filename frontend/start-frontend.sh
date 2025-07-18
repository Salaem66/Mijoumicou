#!/bin/bash

echo "🎨 Mijoumicou - Frontend"
echo "========================"

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

# Vérifier que le backend est démarré
echo "🔍 Vérification du backend..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend accessible sur le port 3001"
else
    echo "⚠️  Backend non détecté sur le port 3001"
    echo "   Assurez-vous de démarrer le backend avec :"
    echo "   cd ../backend && ./start-advanced.sh"
    echo ""
    read -p "Voulez-vous continuer quand même ? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🚀 Démarrage du frontend..."
echo "   Interface : http://localhost:3000"
echo "   Backend   : http://localhost:3001"
echo ""
echo "🎯 Fonctionnalités disponibles :"
echo "   • Interface d'analyse d'humeur sophistiquée"
echo "   • Cartes de jeux élégantes avec détails complets"
echo "   • Recommandations IA avec explications"
echo "   • Animations et micro-interactions"
echo "   • Design system moderne et responsive"
echo ""
echo "💡 Testez avec des phrases comme :"
echo "   • 'Je suis fatigué mais j'ai envie de rigoler'"
echo "   • 'Dimanche pluvieux, envie de stratégie'"
echo "   • 'Grosse soirée jeux entre amis'"
echo ""
echo "🎯 Appuyez sur Ctrl+C pour arrêter le frontend"
echo ""

npm start