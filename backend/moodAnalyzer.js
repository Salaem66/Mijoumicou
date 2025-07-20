const natural = require('natural');

class AdvancedMoodAnalyzer {
  constructor() {
    this.synonymDictionary = {
      // Énergie faible
      'fatigué': { energie_requise: 1.5, mots_clés: ['fatigué', 'crevé', 'épuisé', 'las', 'éreinté', 'vanné'] },
      'calme': { energie_requise: 2.0, mots_clés: ['calme', 'tranquille', 'paisible', 'serein', 'zen', 'posé'] },
      'détendu': { energie_requise: 2.0, mots_clés: ['détendu', 'relaxé', 'cool', 'peinard', 'relax'] },
      
      // Énergie élevée
      'énergique': { energie_requise: 4.5, mots_clés: ['énergique', 'dynamique', 'motivé', 'en forme', 'pêchu'] },
      'excité': { energie_requise: 4.0, mots_clés: ['excité', 'enthousiaste', 'survolté', 'bouillant', 'survitaminé'] },
      'hyperactif': { energie_requise: 5.0, mots_clés: ['hyperactif', 'speed', 'défoncé', 'déchaîné'] },
      
      // Social
      'social': { niveau_social: 4.5, mots_clés: ['social', 'convivial', 'bavard', 'communicatif'] },
      'timide': { niveau_social: 1.5, mots_clés: ['timide', 'introverti', 'discret', 'réservé'] },
      'amis': { niveau_social: 4.0, joueurs_ideal: 5, mots_clés: ['amis', 'potes', 'copains', 'bande'] },
      'famille': { niveau_social: 3.5, joueurs_ideal: 4, mots_clés: ['famille', 'parents', 'enfants', 'fratrie'] },
      
      // Hasard vs Stratégie
      'stratégique': { facteur_chance: 1.5, mots_clés: ['stratégique', 'réfléchi', 'tactique', 'calculé', 'malin'] },
      'hasard': { facteur_chance: 4.0, mots_clés: ['hasard', 'chance', 'aléatoire', 'loterie', 'luck'] },
      'réfléchir': { facteur_chance: 1.0, energie_requise: 3.5, mots_clés: ['réfléchir', 'cogiter', 'calculer', 'analyser'] },
      
      // Tension
      'compétitif': { tension_niveau: 4.0, niveau_conflit: 3.5, mots_clés: ['compétitif', 'concurrentiel', 'challenge'] },
      'zen': { tension_niveau: 1.5, mots_clés: ['zen', 'pépère', 'cool', 'sans prise de tête'] },
      'stressant': { tension_niveau: 4.5, mots_clés: ['stressant', 'tendu', 'intense', 'pressure'] },
      
      // Durée
      'rapide': { duree_max: 30, mots_clés: ['rapide', 'court', 'express', 'speed', 'vite'] },
      'long': { duree_min: 90, mots_clés: ['long', 'épique', 'marathon', 'soirée complète'] },
      '20_minutes': { duree_max: 25, mots_clés: ['20 minutes', 'vingt minutes', 'petit jeu', 'pause'] },
      
      // Contextes temporels
      'apéro': { duree_max: 45, energie_requise: 3.0, mots_clés: ['apéro', 'apéritif', 'début de soirée'] },
      'fin_soirée': { energie_requise: 2.0, mots_clés: ['fin de soirée', 'tard', 'digestion', 'après manger'] },
      'pause_déjeuner': { duree_max: 30, mots_clés: ['pause déjeuner', 'midi', 'pause'] },
      
      // Émotions/Ambiances
      'rigoler': { energie_requise: 4.0, niveau_social: 4.5, mots_clés: ['rigoler', 'marrer', 'fun', 'délire', 'éclater'] },
      'contemplatif': { energie_requise: 2.0, tension_niveau: 1.5, mots_clés: ['contemplatif', 'méditatif', 'pensif'] },
      'créatif': { mots_clés: ['créatif', 'imaginatif', 'artistique', 'inventif', 'original'] },
      
      // Expressions naturelles
      'envie_rigoler': { energie_requise: 4.0, niveau_social: 4.5, tags: ['envie de rigoler'] },
      'pas_réfléchir': { facteur_chance: 4.0, energie_requise: 2.0, tags: ['je veux plus réfléchir'] },
      'soirée_éternise': { duree_min: 90, tags: ['soirée qui s\'éternise'] },
      'dimanche_pluvieux': { energie_requise: 2.0, duree_min: 60, tags: ['dimanche pluvieux'] },
      'découverte': { courbe_apprentissage: 2.0, tags: ['découvrir tranquillement'] },
      'mamie': { complexite: 1.5, age_minimum: 8, tags: ['jouer avec mamie'] },
      'compétition_potes': { tension_niveau: 4.0, niveau_conflit: 3.5, tags: ['compétition entre potes'] },
      
      // Nouvelles expressions courantes
      'détendre': { energie_requise: 2.0, tension_niveau: 1.5, facteur_chance: 3.5, mots_clés: ['détendre', 'se détendre', 'nous détendre', 'détente', 'relaxer'] },
      'nous_voulons': { niveau_social: 4.0, mots_clés: ['nous voulons', 'on veut', 'on aimerait', 'nous aimerions'] },
      'avec_amis': { niveau_social: 4.5, joueurs_ideal: 4, mots_clés: ['avec des amis', 'avec mes amis', 'entre amis', 'amis présents'] },
      'convivial': { niveau_social: 4.0, energie_requise: 3.0, mots_clés: ['convivial', 'sympa', 'agréable', 'bonne ambiance'] },
      'sans_stress': { tension_niveau: 1.5, facteur_chance: 3.5, mots_clés: ['sans stress', 'sans pression', 'décontracté', 'peinard'] },
      
      // Mots-clés spéciaux pour Perudo (démo Célia)
      'nul': { energie_requise: 3.5, niveau_social: 4.5, facteur_chance: 4.0, tags: ['nul', 'fun', 'bluff'], mots_clés: ['nul', 'pourri', 'débile', 'stupide'] },
      'con': { energie_requise: 3.5, niveau_social: 4.5, facteur_chance: 4.0, tags: ['con', 'fun', 'chaos'], mots_clés: ['con', 'connard', 'abruti', 'crétin', 'CON'] },
      'merde': { energie_requise: 3.5, niveau_social: 4.5, facteur_chance: 4.0, tags: ['merde', 'fun', 'chaos'], mots_clés: ['merde', 'merdique', 'MERDE', 'de merde'] },
      'bluff': { energie_requise: 3.5, niveau_social: 4.5, facteur_chance: 4.0, tags: ['bluff', 'menteur'], mots_clés: ['bluff', 'mentir', 'tricher', 'duper'] }
    };

    this.expressionsComplexes = [
      {
        pattern: /(?:soirée|soir).{0,20}(?:éternise|longue|traîne)/i,
        mapping: { duree_min: 90, tags: ['soirée qui s\'éternise'] }
      },
      {
        pattern: /(?:envie|veux).{0,10}(?:rigoler|marrer|fun)/i,
        mapping: { energie_requise: 4.0, niveau_social: 4.5, tags: ['envie de rigoler'] }
      },
      {
        pattern: /(?:plus|pas).{0,10}(?:réfléchir|cogiter|prendre.{0,10}tête)/i,
        mapping: { facteur_chance: 4.0, energie_requise: 2.0, tags: ['je veux plus réfléchir'] }
      },
      {
        pattern: /(?:avec|jouer).{0,10}(?:mamie|grand-mère|papy|grands?-parents)/i,
        mapping: { complexite: 1.5, age_minimum: 8, tags: ['jouer avec mamie'] }
      },
      {
        pattern: /(?:compétition|défier|challenge).{0,15}(?:amis|potes|copains)/i,
        mapping: { tension_niveau: 4.0, niveau_conflit: 3.5, tags: ['compétition entre potes'] }
      },
      {
        pattern: /(?:apéro|apéritif).{0,10}(?:décontracté|cool|tranquille)/i,
        mapping: { duree_max: 45, energie_requise: 3.0, tags: ['apéro décontracté'] }
      },
      {
        pattern: /(?:dimanche|weekend).{0,10}(?:pluvieux|gris|moche)/i,
        mapping: { energie_requise: 2.0, duree_min: 60, tags: ['dimanche pluvieux'] }
      },
      {
        pattern: /(?:découvrir|apprendre).{0,10}(?:tranquille|cool|pépère)/i,
        mapping: { courbe_apprentissage: 2.0, tags: ['découvrir tranquillement'] }
      },
      {
        pattern: /(?:grosse|grande).{0,10}(?:soirée|session).{0,10}jeux?/i,
        mapping: { duree_min: 120, energie_requise: 4.0, tags: ['grosse soirée jeux'] }
      },
      {
        pattern: /(?:on a|nous avons|seulement).{0,5}(?:20|vingt).{0,5}minutes?/i,
        mapping: { duree_max: 25, tags: ['on a 20 minutes'] }
      },
      {
        pattern: /(?:avec|entre).{0,10}(?:amis|potes|copains)/i,
        mapping: { niveau_social: 4.5, joueurs_ideal: 4, tags: ['entre amis'] }
      },
      {
        pattern: /(?:nous|on).{0,10}(?:voulons|veut|aimerait|aimerions).{0,10}(?:se|nous).{0,5}(?:détendre|relaxer)/i,
        mapping: { energie_requise: 2.0, tension_niveau: 1.5, facteur_chance: 3.5, tags: ['se détendre ensemble'] }
      },
      {
        pattern: /(?:soirée|moment).{0,10}(?:décontracté|cool|tranquille|relax)/i,
        mapping: { energie_requise: 2.5, tension_niveau: 1.5, tags: ['soirée décontractée'] }
      }
    ];

    this.contextMappings = {
      'debut_soiree': { energie_requise: 3.5, duree_max: 60 },
      'fin_soiree': { energie_requise: 2.0, facteur_chance: 3.0 },
      'famille_avec_enfants': { complexite: 2.0, age_minimum: 8, niveau_conflit: 2.0 },
      'entre_gamers': { complexite: 3.0, courbe_apprentissage: 3.5 },
      'couple': { joueurs_ideal: 2, niveau_social: 3.0 },
      'grande_tablée': { joueurs_ideal: 6, niveau_social: 4.5 },
      'voyage': { duree_max: 45, portabilité: 5.0 },
      'pause_dejeuner': { duree_max: 30, energie_requise: 3.0 }
    };
  }

  analyzeMood(text) {
    const lowerText = text.toLowerCase();
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(lowerText);
    
    let analysis = {
      energie_requise: 3.0,
      niveau_social: 3.0,
      facteur_chance: 2.5,
      tension_niveau: 2.5,
      courbe_apprentissage: 2.5,
      rejouabilite: 3.5,
      niveau_conflit: 2.0,
      duree_min: 30,
      duree_max: 90,
      duree_moyenne: 60,
      joueurs_ideal: 4,
      complexite: 2.5,
      age_minimum: 10,
      detected_moods: [],
      detected_expressions: [],
      detected_tags: [],
      confidence_score: 0
    };

    let matchCount = 0;

    // Analyse des expressions complexes
    for (const expr of this.expressionsComplexes) {
      if (expr.pattern.test(text)) {
        this.applyMapping(analysis, expr.mapping);
        analysis.detected_expressions.push(expr.pattern.source);
        if (expr.mapping.tags) {
          analysis.detected_tags.push(...expr.mapping.tags);
        }
        matchCount += 2; // Les expressions complexes valent plus
      }
    }

    // Analyse des mots-clés et synonymes
    for (const [mood, data] of Object.entries(this.synonymDictionary)) {
      if (!data.mots_clés || !Array.isArray(data.mots_clés)) {
        continue;
      }
      
      const matchingWords = data.mots_clés.filter(word => 
        lowerText.includes(word) || tokens.some(token => token.includes(word.split(' ')[0]))
      );
      
      if (matchingWords.length > 0) {
        analysis.detected_moods.push(mood);
        this.applyMapping(analysis, data);
        if (data.tags) {
          analysis.detected_tags.push(...data.tags);
        }
        matchCount += matchingWords.length;
      }
    }

    // Analyse contextuelle spécifique
    analysis = this.analyzeSpecificContexts(text, analysis);

    // Calcul du score de confiance amélioré
    let baseScore = matchCount * 12; // Score de base
    
    // Bonus pour les expressions complexes détectées
    const complexExpressionsFound = analysis.detected_expressions.length;
    baseScore += complexExpressionsFound * 20;
    
    // Bonus pour avoir des informations cohérentes
    let coherenceBonus = 0;
    if (analysis.detected_moods.length > 0) coherenceBonus += 15;
    if (analysis.detected_tags.length > 0) coherenceBonus += 10;
    if (analysis.joueurs_ideal !== 4) coherenceBonus += 10; // Détection du nombre de joueurs
    
    // Bonus de base pour éviter les scores trop faibles
    const minimumScore = 45;
    
    analysis.confidence_score = Math.min(100, Math.max(minimumScore, baseScore + coherenceBonus));

    // Normalisation et cohérence
    analysis = this.normalizeAndValidate(analysis);

    return analysis;
  }

  applyMapping(analysis, mapping) {
    for (const [key, value] of Object.entries(mapping)) {
      if (key === 'tags') continue; // Traité séparément
      
      if (typeof value === 'number') {
        if (analysis[key] !== undefined) {
          // Moyenne pondérée favorisant les nouvelles valeurs
          analysis[key] = (analysis[key] * 0.6) + (value * 0.4);
        } else {
          analysis[key] = value;
        }
      }
    }
  }

  analyzeSpecificContexts(text, analysis) {
    const lowerText = text.toLowerCase();

    // Détection du nombre de joueurs
    const playerPatterns = [
      { pattern: /(?:à|pour|avec)\s*(\d+)\s*joueurs?/i, extract: true },
      { pattern: /(?:nous sommes|on est|à)\s*(\d+)/i, extract: true },
      { pattern: /(?:seul|solo|solitaire)/i, value: 1 },
      { pattern: /(?:en couple|à deux|duo)/i, value: 2 },
      { pattern: /(?:en trio|à trois)/i, value: 3 },
      { pattern: /(?:nombreux|beaucoup|groupe|bande)/i, value: 6 }
    ];

    for (const pattern of playerPatterns) {
      const match = pattern.pattern.exec(lowerText);
      if (match) {
        if (pattern.extract && match[1]) {
          analysis.joueurs_ideal = parseInt(match[1]);
        } else if (pattern.value) {
          analysis.joueurs_ideal = pattern.value;
        }
        break;
      }
    }

    // Détection de contraintes temporelles
    const timePatterns = [
      { pattern: /(\d+)\s*(?:min|minutes?)/i, type: 'max' },
      { pattern: /(?:moins de|maximum)\s*(\d+)/i, type: 'max' },
      { pattern: /(?:plus de|minimum)\s*(\d+)/i, type: 'min' },
      { pattern: /(?:environ|autour de)\s*(\d+)/i, type: 'moyenne' }
    ];

    for (const pattern of timePatterns) {
      const match = pattern.pattern.exec(lowerText);
      if (match) {
        const time = parseInt(match[1]);
        if (pattern.type === 'max') {
          analysis.duree_max = Math.min(analysis.duree_max, time);
        } else if (pattern.type === 'min') {
          analysis.duree_min = Math.max(analysis.duree_min, time);
        } else if (pattern.type === 'moyenne') {
          analysis.duree_moyenne = time;
        }
      }
    }

    // Détection d'humeurs négatives (ce qu'on ne veut PAS)
    if (/(?:pas|plus|jamais).{0,15}(?:complexe|compliqué|dur)/i.test(lowerText)) {
      analysis.complexite = Math.min(analysis.complexite, 2.0);
      analysis.courbe_apprentissage = Math.min(analysis.courbe_apprentissage, 2.0);
    }

    if (/(?:pas|plus|jamais).{0,15}(?:long|éternel|infini)/i.test(lowerText)) {
      analysis.duree_max = Math.min(analysis.duree_max, 60);
    }

    if (/(?:pas|plus|jamais).{0,15}(?:conflict|guerre|agressif)/i.test(lowerText)) {
      analysis.niveau_conflit = Math.min(analysis.niveau_conflit, 2.0);
    }

    return analysis;
  }

  normalizeAndValidate(analysis) {
    // Cohérence entre durée min/max/moyenne
    if (analysis.duree_min > analysis.duree_max) {
      [analysis.duree_min, analysis.duree_max] = [analysis.duree_max, analysis.duree_min];
    }
    
    analysis.duree_moyenne = Math.round((analysis.duree_min + analysis.duree_max) / 2);

    // Limitation des valeurs aux plages acceptables
    analysis.energie_requise = Math.max(1, Math.min(5, analysis.energie_requise));
    analysis.niveau_social = Math.max(1, Math.min(5, analysis.niveau_social));
    analysis.facteur_chance = Math.max(1, Math.min(5, analysis.facteur_chance));
    analysis.tension_niveau = Math.max(1, Math.min(5, analysis.tension_niveau));
    analysis.courbe_apprentissage = Math.max(1, Math.min(5, analysis.courbe_apprentissage));
    analysis.rejouabilite = Math.max(1, Math.min(5, analysis.rejouabilite));
    analysis.niveau_conflit = Math.max(1, Math.min(5, analysis.niveau_conflit));
    analysis.complexite = Math.max(1, Math.min(5, analysis.complexite));
    analysis.joueurs_ideal = Math.max(1, Math.min(10, analysis.joueurs_ideal));
    analysis.duree_min = Math.max(5, analysis.duree_min);
    analysis.duree_max = Math.min(300, analysis.duree_max);

    // Suppression des doublons dans les tags
    analysis.detected_tags = [...new Set(analysis.detected_tags)];
    analysis.detected_moods = [...new Set(analysis.detected_moods)];

    return analysis;
  }

  // Fonction pour calculer la compatibilité entre une analyse et un jeu
  calculateGameCompatibility(analysis, game) {
    let score = 0;
    let explanations = [];

    // Énergie requise (poids fort)
    const energyDiff = Math.abs(analysis.energie_requise - game.energie_requise);
    const energyScore = Math.max(0, (2 - energyDiff) * 15);
    score += energyScore;
    if (energyScore > 10) {
      explanations.push(`Niveau d'énergie parfaitement adapté (${game.energie_requise}/5)`);
    }

    // Interaction sociale (poids fort)
    const socialDiff = Math.abs(analysis.niveau_social - game.niveau_social);
    const socialScore = Math.max(0, (2 - socialDiff) * 15);
    score += socialScore;
    if (socialScore > 10) {
      explanations.push(`Interaction sociale idéale (${game.niveau_social}/5)`);
    }

    // Facteur chance vs stratégie
    const chanceDiff = Math.abs(analysis.facteur_chance - game.facteur_chance);
    const chanceScore = Math.max(0, (2 - chanceDiff) * 10);
    score += chanceScore;

    // Durée
    if (game.duree_moyenne >= analysis.duree_min && game.duree_moyenne <= analysis.duree_max) {
      score += 20;
      explanations.push(`Durée parfaite : ${game.duree_moyenne} minutes`);
    } else if (game.duree_moyenne <= analysis.duree_max + 15 && game.duree_moyenne >= analysis.duree_min - 15) {
      score += 10;
    }

    // Nombre de joueurs
    if (game.joueurs_min <= analysis.joueurs_ideal && game.joueurs_max >= analysis.joueurs_ideal) {
      score += 15;
      explanations.push(`Parfait pour ${analysis.joueurs_ideal} joueurs`);
    }

    // Complexité
    const complexityDiff = Math.abs(analysis.complexite - game.complexite);
    if (complexityDiff <= 0.5) {
      score += 10;
      explanations.push(`Complexité adaptée (${game.complexite}/5)`);
    }

    // Vérification des tags mood
    const gameTags = game.tags_mood || [];
    const analyseTags = analysis.detected_tags || [];
    let tagMatches = [];
    
    if (Array.isArray(gameTags) && Array.isArray(analyseTags)) {
      tagMatches = analyseTags.filter(tag => 
        gameTags.some(gameTag => 
          typeof gameTag === 'string' && typeof tag === 'string' && 
          gameTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
    }
    
    score += tagMatches.length * 10;
    if (tagMatches.length > 0) {
      explanations.push(`Correspond à vos envies : ${tagMatches.join(', ')}`);
    }

    return {
      score: Math.round(score),
      explanations,
      compatibility_details: {
        energy_match: energyScore,
        social_match: socialScore,
        duration_match: (game.duree_moyenne >= analysis.duree_min && game.duree_moyenne <= analysis.duree_max),
        player_match: (game.joueurs_min <= analysis.joueurs_ideal && game.joueurs_max >= analysis.joueurs_ideal),
        tag_matches: tagMatches
      }
    };
  }
}

module.exports = AdvancedMoodAnalyzer;