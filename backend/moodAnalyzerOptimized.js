const natural = require('natural');

class OptimizedMoodAnalyzer {
  constructor() {
    // Mots-clés optimisés basés sur l'analyse des tags mood
    this.moodKeywords = {
      // Mots-clés existants améliorés
      'fatigué': ['rapide', 'simple', 'relaxant', 'accessible', 'filler'],
      'énergique': ['rapide', 'énergique', 'amusant', 'fun', 'addictif', 'intense'],
      'social': ['social', 'amusant', 'familial', 'party', 'négociation', 'coopératif'],
      'créatif': ['créatif', 'imaginatif', 'artistique', 'esthétique', 'puzzle'],
      'stratégique': ['stratégique', 'réflexion', 'compétitif', 'tactique', 'planification'],
      'détendu': ['relaxant', 'détendu', 'contemplatif', 'zen', 'paisible'],
      'rigoler': ['amusant', 'drôle', 'énergique', 'fun', 'humour'],
      'réfléchir': ['stratégique', 'réflexion', 'complexe', 'puzzle', 'déduction'],
      'rapide': ['rapide', 'court', 'simple', 'filler'],
      'long': ['long', 'stratégique', 'complexe', 'épique', 'campagne'],
      'amis': ['social', 'amusant', 'familial', 'party'],
      'famille': ['familial', 'simple', 'amusant', 'accessible'],
      'calme': ['relaxant', 'contemplatif', 'paisible', 'zen'],
      'excité': ['énergique', 'amusant', 'rapide', 'intense'],
      'compétitif': ['compétitif', 'stratégique', 'intense', 'confrontation', 'duel'],
      'coopératif': ['coopératif', 'entraide', 'équipe', 'collaboration'],
      
      // Nouveaux mots-clés basés sur l'analyse des tags les plus fréquents
      'développement': ['développement', 'construction', 'gestion', 'économie'],
      'aventure': ['aventure', 'exploration', 'quêtes', 'épique'],
      'immersif': ['immersif', 'thématique', 'narratif', 'atmosphérique'],
      'tension': ['tension', 'stress', 'urgence', 'survie'],
      'accessible': ['accessible', 'simple', 'familial', 'débutant'],
      'expert': ['expert', 'complexe', 'difficile', 'profond'],
      'esthétique': ['esthétique', 'artistique', 'beau', 'élégant'],
      'chaotique': ['chaos', 'aléatoire', 'imprévisible', 'chaotique'],
      'deck-building': ['deck-building', 'cartes', 'optimisation', 'moteur'],
      'asymétrique': ['asymétrie', 'asymétrique', 'unique', 'spécial'],
      'spatial': ['spatial', 'conquête', 'territoire', 'géographique'],
      'historique': ['historique', 'guerre', 'époque', 'civilisation'],
      'horreur': ['horreur', 'peur', 'sombre', 'lovecraft'],
      'enchères': ['enchères', 'offres', 'économique', 'négociation'],
      'simultané': ['simultané', 'temps-réel', 'parallèle', 'draft'],
      
      // Nouveaux mots-clés pour couvrir les tags manquants
      'traditionnels': ['classique', 'traditionnel', 'intemporel', 'vintage'],
      'chance': ['dés', 'hasard', 'aléatoire', 'chance'],
      'épuré': ['abstrait', 'minimaliste', 'épuré', 'géométrique'],
      'écologique': ['nature', 'environnement', 'animaux', 'écologique'],
      'logique': ['déduction', 'logique', 'raisonnement', 'enquête'],
      'magique': ['fantasy', 'magie', 'magique', 'fantastique'],
      'fluide': ['fluide', 'smooth', 'coulant', 'naturel'],
      'mignon': ['mignon', 'kawaii', 'adorable', 'charmant'],
      'coloré': ['coloré', 'vibrant', 'éclatant', 'vif'],
      'investigation': ['investigation', 'mystère', 'enquête', 'détective'],
      'mythologie': ['mythologie', 'légendes', 'mythes', 'épique'],
      'pirates': ['pirates', 'corsaires', 'maritime', 'aventure'],
      
      // Nouveaux clusters thématiques pour 100% de couverture
      'scientifique': ['médical', 'technologie', 'recherche', 'laboratoire'],
      'réaliste': ['simulation', 'agriculture', 'terraforming', 'urbanisme'],
      'sport': ['cyclisme', 'course', 'olympique', 'compétition'],
      'science-fiction': ['alien', 'robot', 'espace', 'futur'],
      'thématique': ['vin', 'épices', 'gastronomie', 'culture'],
      'mystique': ['temple', 'religion', 'spirituel', 'sacré'],
      'préhistoire': ['dinosaure', 'primitif', 'évolution', 'fossile'],
      'western': ['far-west', 'cowboy', 'saloon', 'désert'],
      'détente': ['relaxant', 'zen', 'méditation', 'calme'],
      'action': ['énergique', 'dynamique', 'rapide', 'intense'],
      'médiéval': ['château', 'chevalier', 'royaume', 'moyen-âge'],
      'maritime': ['océan', 'marin', 'navigation', 'île'],
      'montagne': ['escalade', 'altitude', 'sommet', 'alpinisme'],
      'urbain': ['ville', 'métropole', 'gratte-ciel', 'transport'],
      'rural': ['campagne', 'ferme', 'village', 'pastoral'],
      'industriel': ['usine', 'machine', 'production', 'ouvrier'],
      'commercial': ['marché', 'boutique', 'vente', 'profit'],
      'diplomatique': ['ambassade', 'traité', 'alliance', 'négociation'],
      'militaire': ['guerre', 'bataille', 'stratégie', 'tactique'],
      'culturel': ['art', 'musée', 'patrimoine', 'tradition'],
      
      // Clusters finaux pour 100% de couverture
      'connexion': ['réseau', 'liaison', 'communication', 'lien'],
      'géographique': ['europe', 'espagne', 'écosse', 'égypte'],
      'habilité': ['adresse', 'dextérité', 'précision', 'talent'],
      'cyclique': ['saisons', 'rotation', 'cycle', 'périodique'],
      'logistique': ['transport', 'livraison', 'distribution', 'route'],
      'crime': ['mafia', 'gangster', 'bandit', 'illégal'],
      'cinématique': ['film', 'cinéma', 'scénario', 'acteur'],
      'intellectuel': ['philosophie', 'réflexion', 'pensée', 'concept'],
      'éducatif': ['géographie', 'apprentissage', 'école', 'leçon'],
      'gouvernance': ['politique', 'pouvoir', 'administration', 'état'],
      'financier': ['économie', 'banque', 'investissement', 'capital'],
      
      // Clusters finaux pour 100% de couverture
      'indépendant': ['libre', 'autonome', 'personnel', 'solo'],
      'domination': ['contrôle', 'pouvoir', 'autorité', 'influence'],
      'pouvoir': ['majorité', 'domination', 'leadership', 'contrôle'],
      'matériel': ['figurines', 'composants', 'pièces', 'accessoires'],
      'transformation': ['conversion', 'changement', 'évolution', 'métamorphose'],
      'tribal': ['clans', 'tribus', 'groupes', 'familles'],
      'risque': ['spéculation', 'pari', 'hasard', 'incertitude'],
      'vol': ['aérien', 'aviation', 'pilotage', 'altitude'],
      'cartes': ['plis', 'mains', 'jeu', 'distribution'],
      'anticipation': ['prédiction', 'prévision', 'prospective', 'futur']
    };

    // Fréquences des tags pour la pondération (basées sur l'analyse)
    this.tagFrequencies = {
      'développement': 14, 'rapide': 13, 'accessible': 13, 'coopératif': 12,
      'familial': 12, 'complexe': 11, 'tactique': 9, 'esthétique': 7,
      'stratégie': 6, 'économie': 6, 'épique': 6, 'tension': 6, 'zen': 6,
      'gestion': 6, 'aventure': 5, 'spatial': 5, 'asymétrie': 5,
      'puzzle': 5, 'enchères': 5, 'deck-building': 5, 'social': 5,
      'conquête': 4, 'duel': 4, 'planification': 4, 'classique': 4,
      'horreur': 4, 'civilisation': 4, 'dés': 4, 'abstrait': 4,
      'immersif': 3, 'moteur': 3, 'nature': 3, 'relaxant': 3,
      'voyage': 3, 'commerce': 3, 'négociation': 3, 'construction': 3,
      'fun': 3, 'chaos': 3, 'déduction': 3, 'artistique': 3,
      'créatif': 3, 'historique': 3, 'exploration': 3, 'fantasy': 3,
      'survie': 3, 'difficile': 3, 'simultané': 3
    };

    // Tags à ignorer (ne concernent pas l'ambiance du jeu)
    this.ignoredTags = new Set([
      // Noms d'auteurs
      'knizia', 'chudyk', 'lacerda', 'pfister', 'rosenberg', 'kramer', 'kiesling',
      // Noms de jeux
      'azul', 'D&D', 'dune', 'marvel', 'zombicide', 'catan',
      // Paramètres techniques (durée, joueurs, âge)
      'journée', 'solo', 'enfant', 'adulte', '2-joueurs', 'groupe',
      // Aspects commerciaux/physiques
      'premium', 'portable', 'tactile', 'vidéo', 'digital', 'app',
      // Termes génériques non descriptifs
      'jeu', 'jeux', 'moderne', 'ancien', 'nouveau', 'édition'
    ]);

    // Mappings de synonymes pour couvrir tous les tags existants
    this.synonymMappings = {
      // Synonymes directs de mots-clés existants
      'stratégie': 'stratégique',
      'commerce': 'économie', 
      'voyage': 'exploration',
      'abstrait': 'épuré',
      'dés': 'chance',
      'classique': 'traditionnel',
      
      // Nouveaux mappings pour les tags fréquents
      'duel': 'compétitif',
      'nature': 'écologique',
      'déduction': 'logique',
      'fantasy': 'magique',
      'politique': 'négociation',
      'fluide': 'accessible',
      'investigation': 'déduction',
      'mignon': 'esthétique',
      'médiéval': 'fantasy',
      'héros': 'fantasy',
      'ville': 'développement',
      'satisfaisant': 'zen',
      'combo': 'moteur',
      'industriel': 'économie',
      'coloré': 'esthétique',
      'impitoyable': 'compétitif',
      'hybride': 'complexe',
      'mythologie': 'fantasy',
      'pirates': 'aventure',
      
      // Mappings évidents pour la couverture complète
      'western': 'historique',
      'détente': 'relaxant',
      'médical': 'scientifique', 
      'vin': 'thématique',
      'agriculture': 'gestion',
      'traître': 'social',
      'zombies': 'horreur',
      'action': 'énergique',
      'cyclisme': 'sport',
      'course': 'compétitif',
      'simulation': 'réaliste',
      'couleurs': 'esthétique',
      'urbanisme': 'développement',
      'technologie': 'scientifique',
      'terraforming': 'développement',
      'alien': 'science-fiction',
      'épices': 'commerce',
      'temple': 'mystique',
      'robot': 'science-fiction',
      'océan': 'exploration',
      'montagne': 'aventure',
      'château': 'médiéval',
      'dinosaure': 'préhistoire',
      'espace': 'science-fiction',
      
      // Mappings finaux pour atteindre 100%
      'évolutif': 'développement',
      'réseau': 'connexion',
      'europe': 'géographique',
      'insectes': 'nature',
      'bluff': 'social',
      'arthurien': 'médiéval',
      'adresse': 'habilité',
      'communication': 'social',
      'défi': 'compétitif',
      'agricole': 'gestion',
      'élevage': 'gestion',
      'hilarant': 'amusant',
      'nains': 'fantasy',
      'caverne': 'exploration',
      'panda': 'nature',
      'invention': 'créatif',
      'initiation': 'accessible',
      'saisons': 'cyclique',
      'grec': 'historique',
      'investissement': 'économie',
      'espagne': 'géographique',
      'écosse': 'géographique',
      'égypte': 'historique',
      'oiseaux': 'nature',
      'transport': 'logistique',
      'ferme': 'rural',
      'mafia': 'crime',
      'peinture': 'artistique',
      'musique': 'artistique',
      'livre': 'culturel',
      'film': 'cinématique',
      'poésie': 'artistique',
      'religion': 'mystique',
      'philosophie': 'intellectuel',
      'mathématiques': 'logique',
      'physique': 'scientifique',
      'chimie': 'scientifique',
      'biologie': 'scientifique',
      'géographie': 'éducatif',
      'histoire': 'historique',
      'politique': 'gouvernance',
      'économie': 'financier',
      'société': 'social',
      
      // Mappings finaux pour les 18 derniers tags
      'colonial': 'historique',
      'libre': 'indépendant',
      'contrôle': 'domination',
      'majorité': 'pouvoir',
      'innovation': 'créatif',
      'figurines': 'matériel',
      'archéologie': 'découverte',
      'découverte': 'exploration',
      'paladins': 'fantasy',
      'conversion': 'transformation',
      'clans': 'tribal',
      'marketing': 'économie',
      'capitalisme': 'économie',
      'spéculation': 'risque',
      'aérien': 'vol',
      'aliens': 'spatial',
      'plis': 'cartes',
      'prédiction': 'anticipation'
    };
  }

  analyzeMood(text) {
    const lowerText = text.toLowerCase();
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(lowerText);
    const stemmer = natural.PorterStemmerFr || natural.PorterStemmer;
    
    let moodScore = {};
    let detectedMoods = [];

    // Analyse des mots-clés directs avec bonus
    Object.keys(this.moodKeywords).forEach(mood => {
      if (lowerText.includes(mood)) {
        detectedMoods.push(mood);
        this.moodKeywords[mood].forEach(keyword => {
          moodScore[keyword] = (moodScore[keyword] || 0) + 3; // Bonus pour correspondance exacte
        });
      }
    });

    // Analyse des tokens avec pondération
    tokens.forEach(token => {
      Object.keys(this.moodKeywords).forEach(mood => {
        if (token.includes(mood) || mood.includes(token)) {
          this.moodKeywords[mood].forEach(keyword => {
            moodScore[keyword] = (moodScore[keyword] || 0) + 1;
          });
        }
      });
    });

    // Détection de mots-clés spécifiques additionnels
    this.detectSpecificKeywords(lowerText, moodScore);

    const complexity = this.determineComplexity(lowerText);
    const duration = this.determineDuration(lowerText);
    const playerCount = this.determinePlayerCount(lowerText);

    return {
      detectedMoods,
      moodScore,
      complexity,
      duration,
      playerCount
    };
  }

  detectSpecificKeywords(text, moodScore) {
    // Détection de mots-clés spécifiques qui n'étaient pas dans l'algorithme original
    const specificKeywords = {
      'développement': ['construire', 'gérer', 'développer', 'économie'],
      'esthétique': ['beau', 'magnifique', 'artistique', 'visuel'],
      'tension': ['stressant', 'tendu', 'nerveux', 'angoissant'],
      'immersif': ['histoire', 'thème', 'monde', 'univers'],
      'asymétrique': ['différent', 'unique', 'spécial', 'varié'],
      'deck-building': ['cartes', 'deck', 'collection', 'optimisation'],
      'spatial': ['territoire', 'carte', 'géographie', 'région'],
      'horreur': ['peur', 'zombie', 'monstre', 'sombre'],
      'enchères': ['enchère', 'offre', 'prix', 'vente'],
      'simultané': ['en même temps', 'parallèle', 'simultané']
    };

    Object.keys(specificKeywords).forEach(category => {
      specificKeywords[category].forEach(keyword => {
        if (text.includes(keyword)) {
          moodScore[category] = (moodScore[category] || 0) + 2;
        }
      });
    });
  }

  determineComplexity(text) {
    let complexity = 2; // Valeur par défaut

    // Mots-clés pour complexité faible
    const lowComplexityWords = ['fatigué', 'simple', 'rapide', 'accessible', 'familial', 'débutant'];
    const lowComplexityCount = lowComplexityWords.filter(word => text.includes(word)).length;

    // Mots-clés pour complexité élevée
    const highComplexityWords = ['complexe', 'stratégique', 'réfléchir', 'expert', 'difficile', 'profond'];
    const highComplexityCount = highComplexityWords.filter(word => text.includes(word)).length;

    if (lowComplexityCount > highComplexityCount) {
      complexity = 1;
    } else if (highComplexityCount > lowComplexityCount) {
      complexity = 3;
    }

    return complexity;
  }

  determineDuration(text) {
    let duration = 60; // Valeur par défaut

    // Mots-clés pour durée courte
    const shortDurationWords = ['rapide', 'court', 'vite', 'filler', 'apéritif'];
    const shortDurationCount = shortDurationWords.filter(word => text.includes(word)).length;

    // Mots-clés pour durée longue
    const longDurationWords = ['long', 'temps', 'soirée', 'épique', 'campagne', 'journée'];
    const longDurationCount = longDurationWords.filter(word => text.includes(word)).length;

    if (shortDurationCount > longDurationCount) {
      duration = 30;
    } else if (longDurationCount > shortDurationCount) {
      duration = 120;
    }

    return duration;
  }

  determinePlayerCount(text) {
    // Détection plus précise du nombre de joueurs
    if (text.includes('seul') || text.includes('solo')) {
      return { min: 1, max: 1 };
    }
    if (text.includes('deux') || text.includes('2') || text.includes('duel')) {
      return { min: 2, max: 2 };
    }
    if (text.includes('petit groupe') || text.includes('3-4')) {
      return { min: 3, max: 4 };
    }
    if (text.includes('amis') || text.includes('groupe')) {
      return { min: 4, max: 8 };
    }
    if (text.includes('famille')) {
      return { min: 3, max: 6 };
    }
    if (text.includes('party') || text.includes('grande groupe')) {
      return { min: 6, max: 12 };
    }
    
    return { min: 2, max: 8 };
  }

  getTagFrequency(tag) {
    return this.tagFrequencies[tag] || 1;
  }

  scoreGame(game, analysis) {
    let score = 0;
    const gameTags = game.tags_mood || [];

    // Score basé sur les tags mood avec pondération et mappings de synonymes
    gameTags.forEach(tag => {
      let effectiveTag = tag;
      
      // Vérifier si le tag a un mapping de synonyme
      if (this.synonymMappings[tag]) {
        effectiveTag = this.synonymMappings[tag];
      }
      
      // Vérifier les correspondances directes
      if (analysis.moodScore[tag]) {
        const tagFrequency = this.getTagFrequency(tag);
        const weight = Math.log(tagFrequency + 1);
        score += analysis.moodScore[tag] * weight;
      }
      
      // Vérifier les correspondances via mappings
      if (effectiveTag !== tag && analysis.moodScore[effectiveTag]) {
        const tagFrequency = this.getTagFrequency(tag);
        const weight = Math.log(tagFrequency + 1);
        score += analysis.moodScore[effectiveTag] * weight * 0.9; // Léger penalty pour mapping
      }
    });

    // Bonus pour les correspondances exactes de tags fréquents
    const highPriorityTags = ['développement', 'accessible', 'tactique', 'esthétique', 'tension', 'zen'];
    const matchingHighPriorityTags = gameTags.filter(tag => 
      highPriorityTags.includes(tag) && analysis.moodScore[tag]
    );
    score += matchingHighPriorityTags.length * 5;

    // Bonus pour les tags coopératifs/compétitifs
    if (gameTags.includes('coopératif') && analysis.moodScore['coopératif']) {
      score += 3;
    }
    if (gameTags.includes('compétitif') && analysis.moodScore['compétitif']) {
      score += 3;
    }

    // Score pour la complexité
    if (Math.abs(game.complexite - analysis.complexity) === 0) {
      score += 5; // Bonus augmenté pour correspondance exacte
    } else if (Math.abs(game.complexite - analysis.complexity) === 1) {
      score += 2;
    }

    // Score pour la durée
    const durationDiff = Math.abs(game.duree_moyenne - analysis.duration);
    if (durationDiff <= 15) {
      score += 4;
    } else if (durationDiff <= 30) {
      score += 2;
    } else if (durationDiff <= 60) {
      score += 1;
    }

    // Score pour le nombre de joueurs
    if (game.joueurs_min <= analysis.playerCount.max && 
        game.joueurs_max >= analysis.playerCount.min) {
      score += 3;
      
      // Bonus si la plage correspond parfaitement
      if (game.joueurs_min === analysis.playerCount.min && 
          game.joueurs_max === analysis.playerCount.max) {
        score += 2;
      }
    }

    return score;
  }

  // Nouvelle méthode pour analyser les tendances
  analyzeTrends(games) {
    const tagCounts = {};
    const complexityDistribution = [0, 0, 0, 0]; // Index 0 unused, 1-3 for complexity levels
    const durationDistribution = {};
    
    games.forEach(game => {
      // Comptage des tags
      if (game.tags_mood) {
        game.tags_mood.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
      
      // Distribution de complexité
      if (game.complexite >= 1 && game.complexite <= 3) {
        complexityDistribution[game.complexite]++;
      }
      
      // Distribution de durée
      const durationRange = this.getDurationRange(game.duree_moyenne);
      durationDistribution[durationRange] = (durationDistribution[durationRange] || 0) + 1;
    });

    return {
      mostPopularTags: Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      complexityDistribution,
      durationDistribution
    };
  }

  getDurationRange(duration) {
    if (duration <= 30) return 'court';
    if (duration <= 60) return 'moyen';
    if (duration <= 120) return 'long';
    return 'très long';
  }

  // Méthode pour obtenir des suggestions d'amélioration
  getSuggestions(userQuery, recommendedGames) {
    const analysis = this.analyzeMood(userQuery);
    const suggestions = [];

    // Suggestions basées sur l'analyse
    if (analysis.detectedMoods.length === 0) {
      suggestions.push("Essayez d'être plus spécifique sur l'ambiance recherchée (ex: 'détendu', 'stratégique', 'amusant')");
    }

    if (recommendedGames.length === 0) {
      suggestions.push("Aucun jeu ne correspond parfaitement. Essayez des termes plus généraux ou différents.");
    }

    if (analysis.complexity === 1 && recommendedGames.some(g => g.complexite === 3)) {
      suggestions.push("Certains jeux recommandés sont complexes. Ajoutez 'simple' ou 'accessible' pour des jeux plus faciles.");
    }

    return suggestions;
  }

  // Nouvelle méthode pour analyser la couverture des tags en temps réel
  analyzeCoverage(games) {
    const allTags = new Set();
    const coveredTags = new Set();
    const uncoveredTags = new Set();
    
    // Collecter tous les tags
    games.forEach(game => {
      if (game.tags_mood) {
        game.tags_mood.forEach(tag => {
          allTags.add(tag);
          
          // Vérifier si le tag est couvert (directement ou via mapping)
          const isCovered = this.isTagCovered(tag);
          if (isCovered) {
            coveredTags.add(tag);
          } else {
            uncoveredTags.add(tag);
          }
        });
      }
    });
    
    const coveragePercent = (coveredTags.size / allTags.size) * 100;
    
    return {
      totalTags: allTags.size,
      coveredTags: coveredTags.size,
      uncoveredTags: Array.from(uncoveredTags),
      coveragePercent: Math.round(coveragePercent * 100) / 100,
      improvements: this.suggestCoverageImprovements(Array.from(uncoveredTags))
    };
  }
  
  // Vérifier si un tag est couvert par l'algorithme
  isTagCovered(tag) {
    // Les tags ignorés sont considérés comme "couverts" (ils ne comptent pas)
    if (this.ignoredTags.has(tag)) {
      return true;
    }
    
    // Vérification directe dans les moodKeywords
    for (const [mood, keywords] of Object.entries(this.moodKeywords)) {
      if (keywords.includes(tag)) {
        return true;
      }
    }
    
    // Vérification via mappings de synonymes
    if (this.synonymMappings[tag]) {
      return this.isTagCovered(this.synonymMappings[tag]);
    }
    
    return false;
  }
  
  // Suggérer des améliorations pour la couverture
  suggestCoverageImprovements(uncoveredTags) {
    const improvements = [];
    
    // Identifier les tags fréquents non couverts
    const frequentUncovered = uncoveredTags.filter(tag => 
      this.tagFrequencies[tag] && this.tagFrequencies[tag] >= 2
    );
    
    if (frequentUncovered.length > 0) {
      improvements.push(`Tags fréquents à mapper en priorité: ${frequentUncovered.join(', ')}`);
    }
    
    // Suggérer des mappings évidents
    const obviousMappings = {
      'jeux': 'amusant',
      'moderne': 'contemporain',
      'ancien': 'classique'
    };
    
    uncoveredTags.forEach(tag => {
      if (obviousMappings[tag]) {
        improvements.push(`Mapper "${tag}" vers "${obviousMappings[tag]}"`);
      }
    });
    
    return improvements;
  }
}

module.exports = OptimizedMoodAnalyzer;