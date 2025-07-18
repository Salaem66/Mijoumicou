# 🎲 Mijoumicou - Assistant IA pour Jeux de Société

Application web intelligente qui recommande des jeux de société selon votre humeur grâce à l'intelligence artificielle.

## ✨ Fonctionnalités

- **🧠 Analyse d'humeur avancée** : Décrivez votre état d'esprit en langage naturel
- **🎯 Recommandations personnalisées** : Suggestions adaptées avec explications détaillées
- **📚 Base de données enrichie** : 20+ jeux avec caractéristiques complètes
- **💼 Bibliothèque personnelle** : Gérez votre collection de jeux
- **🎨 Interface moderne** : Design élégant avec animations et micro-interactions

## 🚀 Démarrage rapide

### Backend
```bash
cd backend
npm install
./start-advanced.sh     # Démarre le serveur sur le port 3001
```

### Frontend
```bash
cd frontend
npm install
./start-frontend.sh     # Démarre l'interface sur le port 3000
```

Puis ouvrez http://localhost:3000 dans votre navigateur.

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Port** : 3001
- **Base de données** : SQLite en mémoire avec sauvegarde JSON
- **NLP** : Analyse sophistiquée avec synonymes et expressions complexes
- **API** : 8+ endpoints pour recommandations, recherche et gestion

### Frontend (React/TypeScript)
- **Port** : 3000
- **Stack** : React 19 + TypeScript + Tailwind CSS + Framer Motion
- **Composants** : Interface modulaire avec design system
- **Services** : API service et gestion de bibliothèque locale

## 🎮 Utilisation

1. **Décrivez votre humeur** : "Je suis fatigué mais j'ai envie de rigoler avec mes amis"
2. **Recevez des recommandations** : L'IA analyse votre demande et propose des jeux adaptés
3. **Explorez les détails** : Consultez les caractéristiques et explications
4. **Gérez votre collection** : Ajoutez vos jeux favoris à votre bibliothèque

## 📊 Algorithme de recommandation

L'IA analyse 8 critères principaux :
- **Énergie requise** (1-5) : Niveau d'activité du jeu
- **Niveau social** (1-5) : Interaction entre joueurs
- **Facteur chance** (1-5) : Part de hasard vs stratégie
- **Tension** (1-5) : Niveau de stress/compétitivité
- **Complexité** (1-5) : Difficulté d'apprentissage
- **Rejouabilité** (1-5) : Potentiel de replay
- **Durée** : Temps de jeu optimal
- **Nombre de joueurs** : Configuration idéale

## 🎯 Exemples de recherche

- *"Je suis fatigué mais j'ai envie de rigoler avec mes amis"* → Jeux fun et sociaux, énergie modérée
- *"Grosse soirée jeux entre potes"* → Jeux party et interaction, longue durée
- *"Apéro décontracté en couple"* → Jeux courts et romantiques à deux

## 🛠️ Développement

### Structure du projet
```
mijoumicou/
├── backend/
│   ├── server.js              # Serveur Express principal
│   ├── database.js            # Gestion base de données
│   ├── moodAnalyzer.js        # Moteur d'analyse NLP
│   └── games_data.json        # Base de données des jeux
├── frontend/
│   ├── src/
│   │   ├── components/        # Composants React
│   │   ├── services/          # Services API et bibliothèque
│   │   └── types/             # Types TypeScript
│   └── tailwind.config.js     # Configuration Tailwind
└── CLAUDE.md                  # Documentation technique
```

### Scripts utiles
```bash
# Backend
./start-advanced.sh           # Démarre le serveur avec vérifications
./test-system.sh             # Tests système

# Frontend
./start-frontend.sh          # Démarre avec vérification backend
npm run build                # Build de production
npm test                     # Tests unitaires
```

## 🤝 Contribution

Le projet est conçu pour être extensible :
- **Ajout de jeux** : Modifier `games_data.json`
- **Amélioration NLP** : Étendre `moodAnalyzer.js`
- **Nouveaux composants** : Suivre la structure existante
- **API endpoints** : Ajouter dans `server.js`

## 📄 License

MIT License - Créé avec ❤️ pour des soirées jeux parfaites