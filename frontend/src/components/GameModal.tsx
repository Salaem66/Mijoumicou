import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Users, Zap, Brain, Target, Shield, TrendingUp, Heart, Award, AlertCircle, BookmarkPlus, BookmarkCheck } from 'lucide-react';
import { Game } from '../types';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useLibrary } from '../services/library';

interface GameModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
  origin?: { x: number; y: number } | null;
}

const getGameObjective = (game: Game): string => {
  // Utiliser le nom du jeu pour déterminer l'explication
  const gameName = game.nom.toLowerCase();
  
  // Base de données des explications de jeux
  const gameObjectives: { [key: string]: string } = {
    'azul': 'Votre objectif est de décorer magnifiquement les murs de votre palais royal en plaçant stratégiquement des azulejos (carreaux de céramique portugais). Chaque tour, vous devez choisir des tuiles de couleur sur des présentoirs communs, puis les placer sur votre plateau personnel. Le défi consiste à compléter des lignes horizontales pour marquer des points, tout en évitant de casser des tuiles (ce qui vous fait perdre des points). Celui qui accumule le plus de points à la fin gagne.',
    
    'wingspan': 'Incarnez un passionné d\'ornithologie qui cherche à attirer le plus d\'oiseaux possible dans ses réserves naturelles. Votre but est de jouer des cartes oiseaux dans trois habitats différents (forêt, prairie, zones humides) pour créer des combinaisons efficaces. Chaque oiseau a des capacités spéciales qui s\'activent quand vous utilisez son habitat. Vous devez gérer vos ressources (nourriture, œufs) et vos actions pour maximiser vos points de victoire.',
    
    'splendor': 'Vous êtes un marchand de gemmes à la Renaissance qui tente de bâtir un empire commercial. Votre objectif est d\'acquérir des mines et des moyens de transport pour collecter des gemmes précieuses, puis utiliser ces ressources pour acheter des cartes développement qui vous donnent des bonus permanents. Le premier à atteindre 15 points de prestige en attirant des nobles fortunés remporte la partie.',
    
    'ticket to ride': 'Partez pour un voyage ferroviaire à travers l\'Amérique du Nord ! Votre mission est de relier des villes en construisant des lignes de chemin de fer. Vous devez collecter des cartes wagon de différentes couleurs pour revendiquer des routes sur la carte, tout en essayant de compléter des billets de destination secrets qui vous rapportent des points bonus. Attention : les routes sont limitées et vos adversaires peuvent vous bloquer !',
    
    'catan': 'Vous êtes un colon qui explore et développe l\'île de Catan. Votre but est de construire des colonies, des villes et des routes en collectant et échangeant des ressources (bois, argile, blé, mouton, minerai). Chaque tour, les dés déterminent quelles ressources sont produites. Le premier joueur à atteindre 10 points de victoire (obtenus via vos constructions et cartes développement) remporte la partie.',
    
    'king of tokyo': 'Incarnez un monstre géant qui veut dominer Tokyo ! Votre objectif est simple : détruire vos rivaux ou être le premier à accumuler 20 points de victoire. À chaque tour, lancez 6 dés spéciaux pour gagner de l\'énergie (pour acheter des cartes), attaquer les autres monstres, ou gagner des points. Celui qui contrôle Tokyo gagne des points bonus mais devient la cible de tous les autres !',
    
    'pandemic': 'Vous êtes une équipe de spécialistes qui doit sauver le monde de quatre maladies mortelles. Votre mission commune est de découvrir les quatre remèdes avant que les épidémies ne se propagent hors de contrôle. Chaque joueur a un rôle unique (médecin, scientifique, etc.) avec des capacités spéciales. Vous devez collaborer, gérer les épidémies et optimiser vos actions pour réussir ensemble cette mission de sauvetage mondiale.',
    
    '7 wonders': 'Dirigez l\'une des sept grandes cités de l\'Antiquité et menez-la à la gloire ! Votre objectif est de développer votre civilisation en construisant des structures dans trois domaines : militaire, commercial et scientifique. Chaque âge, vous choisissez simultanément des cartes qui vous permettent de progresser, tout en construisant votre merveille du monde. Celui qui accumule le plus de points de victoire à travers tous les domaines gagne.',
    
    'dominion': 'Vous êtes un monarque qui étend son royaume en acquérant de nouvelles terres et richesses. Votre deck de départ contient quelques cartes basiques, mais votre objectif est de l\'améliorer en achetant de meilleures cartes (actions, trésors, victoire) dans une réserve commune. Plus vous optimisez votre deck, plus vous pourrez acheter de cartes victoire précieuses. Celui qui a le plus de points dans son deck à la fin gagne.',
    
    'agricola': 'Vous dirigez une famille de fermiers au 17ème siècle qui doit développer sa propriété agricole. Votre objectif est de transformer votre modeste cabane en bois en une ferme prospère avec des champs cultivés, des pâturages avec du bétail, et une maison en pierre. Chaque tour, placez vos pions famille sur des actions pour collecter des ressources, agrandir votre ferme et nourrir votre famille. Le fermier le plus efficace gagne !',
    
    'terraforming mars': 'Vous dirigez une corporation dans un futur proche chargée de terraformer Mars pour la rendre habitable. Votre mission est d\'augmenter la température, le niveau d\'oxygène et de créer des océans sur la planète rouge. Vous devez jouer des cartes projet pour construire des villes, des forêts et des infrastructures, tout en gérant votre économie. Plus vous contribuez à la terraformation, plus vous gagnez de points.',
    
    'scythe': 'Dans un monde alternatif des années 1920, vous dirigez une faction dans l\'Europe de l\'Est post-guerre. Votre objectif est de conquérir des territoires, exploiter des ressources et déployer des mechs gigantesques pour dominer la région. Vous devez équilibrer votre économie, votre popularité auprès du peuple et votre puissance militaire. Le premier à accomplir 6 objectifs majeurs déclenche la fin de partie.',
    
    'exploding kittens': 'C\'est un jeu de survie déjanté où votre seul objectif est de ne pas exploser ! Piochez des cartes à tour de rôle en espérant éviter les cartes "Exploding Kitten" qui vous éliminent instantanément. Utilisez les cartes d\'action pour vous défendre, espionner le deck, ou saboter vos adversaires. Le dernier joueur qui ne s\'est pas fait exploser remporte la partie.',
    
    'uno': 'Débarrassez-vous le plus rapidement possible de toutes vos cartes ! À chaque tour, posez une carte de la même couleur ou du même chiffre que la carte visible. Utilisez les cartes spéciales pour bloquer, faire piocher ou changer la couleur. N\'oubliez pas de crier "UNO" quand il ne vous reste qu\'une carte, sinon vous devrez en piocher deux ! Le premier sans cartes gagne la manche.',
    
    'monopoly': 'Devenez le magnat immobilier le plus riche en achetant, louant et développant des propriétés ! Votre objectif est de faire faillite tous vos adversaires en construisant un empire immobilier. Déplacez-vous sur le plateau en achetant des terrains, construisez des maisons et hôtels pour augmenter les loyers, et gérez vos finances pour survivre aux coups durs. Le dernier joueur encore solvable gagne.',
    
    'carcassonne': 'Vous êtes un seigneur médiéval qui étend son influence dans la campagne française. Votre objectif est de placer stratégiquement des tuiles paysage pour créer des villes, des routes et des monastères, puis y déployer vos partisans (meeples) pour marquer des points. Plus vos constructions sont importantes et complètes, plus vous gagnez de points. Celui qui optimise le mieux ses placements gagne.',
    
    'risk': 'Conquérez le monde ! Votre objectif est de dominer militairement tous les continents en déployant vos armées et en attaquant les territoires ennemis. Chaque tour, vous recevez des renforts selon vos territoires contrôlés, puis vous pouvez attaquer vos voisins dans des combats aux dés. Le premier joueur à accomplir sa mission secrète (ou éliminer tous ses adversaires) remporte la partie.',
    
    'codenames': 'Vous êtes un maître-espion qui doit aider votre équipe à identifier vos agents secrets. Votre objectif est de faire deviner à vos coéquipiers quels mots-codes sur la table correspondent à vos agents, en donnant des indices d\'un seul mot suivi d\'un chiffre. Attention : évitez les agents adverses, les civils innocents, et surtout l\'assassin qui vous fait perdre immédiatement ! La première équipe à identifier tous ses agents gagne.',
    
    'dixit': 'Laissez parler votre imagination ! Votre objectif est de faire deviner votre carte mystérieuse aux autres joueurs grâce à un indice créatif (mot, phrase, son...), mais pas à tous : vous voulez que certains trouvent et d\'autres non. Chaque tour, un joueur donne un indice pour sa carte, et les autres mélangent leurs cartes similaires. Marquez des points en trouvant la bonne carte ou en piégeant intelligemment vos adversaires.',
    
    'jungle speed': 'Soyez le plus rapide à vous débarrasser de toutes vos cartes ! Votre objectif est de repérer quand votre carte retournée a le même symbole qu\'un adversaire, puis d\'être le premier à attraper le totem en bois au centre de la table. Le perdant récupère les cartes de l\'adversaire. Attention aux cartes spéciales qui changent les règles ! Réflexes et concentration sont essentiels.',
    
    'dobble': 'Trouvez le symbole commun le plus rapidement possible ! Chaque carte a exactement un symbole en commun avec n\'importe quelle autre carte du jeu. Selon le mini-jeu choisi, vous devez être le premier à identifier ce symbole commun pour gagner ou vous débarrasser de vos cartes. Observation, rapidité et concentration sont vos meilleurs atouts.',
    
    'saboteur': 'Vous êtes des nains mineurs, mais certains d\'entre vous sont des saboteurs secrets ! L\'objectif des mineurs loyaux est de creuser un tunnel depuis la chambre de départ jusqu\'à l\'or en construisant un chemin avec des cartes tunnel. Les saboteurs doivent empêcher discrètement la construction ou faire échouer la mission. Déduction, bluff et coopération conditionnelle sont les clés du succès.',
    
    'werewolf': 'Dans un village paisible, des loups-garous se cachent parmi les villageois ! Votre objectif dépend de votre rôle secret : si vous êtes un villageois, vous devez identifier et éliminer tous les loups-garous ; si vous êtes un loup-garou, vous devez survivre en éliminant discrètement les villageois chaque nuit. Le jour, tout le monde débat pour décider qui éliminer. Bluff, déduction et psychologie sont essentiels.',
    
    'citadels': 'Construisez la plus belle cité médiévale en incarnant différents personnages aux pouvoirs uniques ! Votre objectif est d\'être le premier à construire une cité de 8 quartiers (ou d\'avoir la plus belle cité à la fin). Chaque tour, choisissez secrètement un personnage (roi, assassin, architecte...) qui détermine vos actions et revenus. Anticipation, bluff et optimisation sont vos outils pour la victoire.',
    
    'love letter': 'Faites parvenir votre lettre d\'amour à la princesse ! Votre objectif est d\'avoir la carte avec la plus haute valeur à la fin du tour (ou d\'être le dernier en jeu). Avec seulement 16 cartes, vous devez déduire qui a quoi et utiliser les pouvoirs de vos cartes pour éliminer vos rivaux ou vous protéger. Déduction, prise de risque et un peu de chance déterminent le vainqueur.',
    
    'bang!': 'Plongez dans l\'ambiance du Far West ! Votre objectif dépend de votre rôle secret : le Shérif doit éliminer tous les Hors-la-loi, les Hors-la-loi veulent tuer le Shérif, l\'Adjoint aide le Shérif, et le Renégat veut être le dernier survivant. Utilisez vos cartes pour attaquer, vous défendre et révéler l\'identité des autres. Bluff, alliances temporaires et gestion des ressources sont cruciaux.',
    
    'the resistance': 'Vous faites partie d\'une résistance contre un régime oppressif, mais des espions se cachent parmi vous ! L\'objectif des résistants est de réussir trois missions ; celui des espions est de saboter trois missions. Chaque mission, une équipe est constituée par vote, puis exécute secrètement la mission. Les espions peuvent la saboter discrètement. Déduction, confiance et manipulation psychologique décident du sort de la résistance.',
    
    'machi koro': 'Développez votre petite ville japonaise pour en faire une métropole prospère ! Votre objectif est d\'être le premier à construire vos 4 monuments majeurs. Chaque tour, lancez les dés pour activer les bâtiments correspondants qui vous donnent des pièces. Utilisez ces revenus pour acheter de nouveaux bâtiments qui génèrent plus de ressources. Optimisation économique et un peu de chance au dé déterminent le vainqueur.',
    
    'space base': 'Vous êtes l\'amiral d\'une flotte spatiale qui doit développer sa base et explorer la galaxie ! Votre objectif est d\'être le premier à atteindre 40 points de victoire en construisant des vaisseaux et en accomplissant des missions. Chaque tour, lancez les dés pour gagner des ressources ou activer vos vaisseaux. Même quand ce n\'est pas votre tour, vous pouvez bénéficier des lancers des autres joueurs. Stratégie à long terme et adaptation sont essentiels.',
    
    'fluxx': 'Bienvenue dans le jeu où les règles changent constamment ! Votre objectif... eh bien, ça dépend ! Au début, vous devez collecter les objets correspondant à l\'objectif actuel, mais les cartes que vous jouez peuvent changer les règles du jeu, l\'objectif à atteindre, ou même les cartes en jeu. Adaptabilité, flexibilité et capacité à saisir les opportunités sont vos meilleurs atouts dans ce chaos contrôlé.',
    
    'sushi go': 'Composez le meilleur menu de sushi en choisissant intelligemment vos cartes ! Votre objectif est de collecter les meilleures combinaisons de sushi pour marquer le plus de points. Chaque tour, choisissez une carte dans votre main puis passez le reste à votre voisin. Différents types de sushi rapportent des points de façons différentes (collection, paires, majorité). Anticipation et adaptation aux choix des autres sont cruciaux.',
    
    'skull king': 'Devenez le roi des pirates en prédisant exactement combien de plis vous allez remporter ! Votre objectif est d\'annoncer au début de chaque manche le nombre exact de plis que vous comptez gagner, puis d\'y parvenir. Vous marquez des points bonus si vous réussissez, mais perdez des points si vous échouez. Cartes spéciales (pirates, sirènes, Skull King) ajoutent du piquant à cette prédiction. Évaluation, prise de risque et psychologie sont essentiels.',
    
    'just one': 'Coopérez pour faire deviner le plus de mots possible à votre équipe ! Votre objectif commun est de faire deviner 13 mots mystères sur 13 essais. Chaque tour, un joueur doit deviner un mot while les autres écrivent secrètement un indice d\'un mot. Mais attention : les indices identiques sont supprimés ! Vous devez donc être créatif et original tout en restant clair. Communication non verbale et créativité collective sont vos armes.',
    
    'wavelength': 'Soyez sur la même longueur d\'onde que votre équipe ! Votre objectif est de deviner où placer un concept sur un spectre entre deux extrêmes (ex: entre "froid" et "chaud"). Un joueur voit la zone cible secrète et doit donner un indice pour guider son équipe. Plus vous êtes proche de la cible, plus vous marquez de points. Empathie, communication subtile et compréhension mutuelle sont essentiels.',
    
    'pictionary': 'Faites deviner des mots en les dessinant ! Votre objectif est de faire deviner à votre équipe le plus de mots possible dans le temps imparti. Chaque tour, un joueur pioche une carte et doit dessiner le mot indiqué sans parler, écrire de lettres ou utiliser des symboles. Ses coéquipiers doivent deviner le mot avant la fin du sablier. Créativité artistique, interprétation et communication visuelle sont vos outils.',
    
    'charades': 'Exprimez-vous sans parler ! Votre objectif est de faire deviner des mots, expressions ou titres à votre équipe en utilisant uniquement des gestes et mimiques. Selon les règles, vous pouvez mimer des films, livres, chansons ou expressions. Vos coéquipiers doivent deviner avant la fin du temps imparti. Expression corporelle, créativité gestuelle et complicité d\'équipe sont essentiels.',
    
    'telestrations': 'Mélange hilarant de téléphone arabe et Pictionary ! Votre objectif est de transmettre un mot en alternant dessins et interprétations écrites. Chaque joueur commence avec un mot secret, le dessine, passe son carnet à son voisin qui écrit ce qu\'il pense voir, puis le suivant dessine cette interprétation, et ainsi de suite. À la fin, découvrez comment votre mot original a évolué ! Créativité, interprétation et surtout... fou rire garanti !'
  };
  
  // Chercher une correspondance exacte ou partielle
  for (const [key, objective] of Object.entries(gameObjectives)) {
    if (gameName.includes(key) || key.includes(gameName)) {
      return objective;
    }
  }
  
  // Si aucune correspondance, générer une explication générique basée sur le type de jeu
  const gameType = game.type_principal.toLowerCase();
  const genericObjectives: { [key: string]: string } = {
    'strategie': `Dans ce jeu de stratégie, votre objectif est de prendre des décisions tactiques pour optimiser vos ressources et actions. Vous devez anticiper les mouvements de vos adversaires tout en développant votre propre stratégie à long terme. La victoire revient généralement au joueur qui aura le mieux planifié et exécuté sa stratégie.`,
    'party': `Ce jeu d'ambiance a pour but de vous faire passer un excellent moment en groupe ! L'objectif principal est de participer activement, de créer des interactions amusantes avec les autres joueurs et de générer rires et bonne humeur. La victoire est souvent secondaire face au plaisir partagé.`,
    'cooperatif': `Votre mission est de travailler ensemble pour atteindre un objectif commun ! Contrairement aux jeux compétitifs, vous devez collaborer, partager des informations et coordonner vos actions pour réussir collectivement. Vous gagnez ou perdez tous ensemble face aux mécaniques du jeu.`,
    'famille': `Ce jeu familial vise à rassembler petits et grands autour d'une activité ludique accessible. L'objectif est de créer des moments de partage intergénérationnels tout en stimulant réflexion et amusement. Les règles sont conçues pour être comprises par tous les âges.`,
    'ambiance': `L'objectif principal est de créer une atmosphère détendue et conviviale ! Ce jeu privilégie l'interaction sociale, les fous rires et les moments de complicité. La compétition passe au second plan face à l'expérience collective et à la bonne humeur générale.`
  };
  
  return genericObjectives[gameType] || `Votre objectif dans ${game.nom} est de maîtriser ses mécaniques uniques pour l'emporter face à vos adversaires. Chaque partie vous demandera d'adapter votre stratégie selon l'évolution du jeu et les actions des autres joueurs. La victoire récompense généralement le joueur qui aura le mieux compris et exploité les subtilités du jeu.`;
};

const GameModal: React.FC<GameModalProps> = ({ game, isOpen, onClose, origin }) => {
  const { addGame, removeGame, hasGame } = useLibrary();
  const [inLibrary, setInLibrary] = useState(game ? hasGame(game.id.toString()) : false);

  if (!game) return null;

  const handleLibraryToggle = () => {
    const gameId = game.id.toString();
    
    if (inLibrary) {
      removeGame(gameId);
      setInLibrary(false);
    } else {
      addGame(gameId);
      setInLibrary(true);
    }
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 2) return 'text-green-600 bg-green-50 border-green-200';
    if (complexity <= 3.5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getComplexityText = (complexity: number) => {
    if (complexity <= 2) return 'Simple';
    if (complexity <= 3.5) return 'Modéré';
    return 'Complexe';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'party': 'bg-purple-100 text-purple-800 border-purple-200',
      'famille': 'bg-blue-100 text-blue-800 border-blue-200',
      'strategie': 'bg-red-100 text-red-800 border-red-200',
      'cooperatif': 'bg-green-100 text-green-800 border-green-200',
      'ambiance': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDuration = (min: number, max: number) => {
    if (min === max) return `${min} minutes`;
    return `${min} à ${max} minutes`;
  };

  const formatPlayers = (min: number, max: number) => {
    if (min === max) return `${min} joueur${min > 1 ? 's' : ''}`;
    return `${min} à ${max} joueurs`;
  };

  const getRatingBar = (value: number, maxValue: number = 5) => {
    const percentage = Math.min(100, (value / maxValue) * 100);
    return (
      <Progress value={percentage} className="h-3" />
    );
  };

  const getModalAnimations = () => {
    if (!origin) {
      return {
        initial: { scale: 0.95, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.95, opacity: 0 }
      };
    }
    
    return {
      initial: { 
        scale: 0.1, 
        opacity: 0
      },
      animate: { 
        scale: 1, 
        opacity: 1
      },
      exit: { 
        scale: 0.1, 
        opacity: 0
      }
    };
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999
          }}
        >
          {/* Overlay de fond */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Modale flottante */}
          <motion.div
            {...getModalAnimations()}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.3
            }}
            className="relative bg-white rounded-2xl overflow-hidden shadow-2xl"
            style={{
              width: 'min(900px, 90vw)',
              height: 'min(700px, 90vh)',
              maxWidth: '90vw',
              maxHeight: '90vh'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
              <div className="absolute top-4 right-4 flex space-x-2">
                <Button
                  onClick={handleLibraryToggle}
                  variant="ghost"
                  size="icon"
                  className={`p-2 hover:bg-white hover:bg-opacity-20 text-white ${inLibrary ? 'bg-white bg-opacity-20' : ''}`}
                  title={inLibrary ? 'Retirer de ma bibliothèque' : 'Ajouter à ma bibliothèque'}
                >
                  {inLibrary ? <BookmarkCheck size={20} /> : <BookmarkPlus size={20} />}
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="p-2 hover:bg-white hover:bg-opacity-20 text-white"
                >
                  <X size={20} />
                </Button>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge className={`${getTypeColor(game.type_principal)}`}>
                      {game.type_principal}
                    </Badge>
                    <Badge className={`${getComplexityColor(game.complexite)}`}>
                      {getComplexityText(game.complexite)}
                    </Badge>
                  </div>
                  
                  <h2 className="text-3xl font-bold mb-2">{game.nom}</h2>
                  {game.nom_anglais && game.nom_anglais !== game.nom && (
                    <p className="text-lg opacity-90 mb-3">{game.nom_anglais}</p>
                  )}
                  <p className="text-blue-100 leading-relaxed">
                    {game.description_courte}
                  </p>
                </div>
                
                {game.compatibility_score && (
                  <Card className="bg-white bg-opacity-20 border-white border-opacity-30">
                    <CardContent className="p-4 text-center text-white">
                      <Award size={24} className="mx-auto mb-2" />
                      <div className="text-2xl font-bold">{game.compatibility_score}%</div>
                      <div className="text-sm opacity-90">Compatibilité</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100% - 140px)' }}>
              {/* Caractéristiques principales */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Caractéristiques</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="text-center p-4">
                      <Clock size={24} className="text-blue-600 mx-auto mb-2" />
                      <div className="text-xs text-gray-600">Durée</div>
                      <div className="font-bold text-gray-900">
                        {formatDuration(game.duree_min, game.duree_max)}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="text-center p-4">
                      <Users size={24} className="text-green-600 mx-auto mb-2" />
                      <div className="text-xs text-gray-600">Joueurs</div>
                      <div className="font-bold text-gray-900">
                        {formatPlayers(game.joueurs_min, game.joueurs_max)}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="text-center p-4">
                      <Target size={24} className="text-purple-600 mx-auto mb-2" />
                      <div className="text-xs text-gray-600">Âge minimum</div>
                      <div className="font-bold text-gray-900">{game.age_minimum}+ ans</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="text-center p-4">
                      <div className="text-2xl font-bold text-yellow-600 mb-2">€</div>
                      <div className="text-xs text-gray-600">Prix moyen</div>
                      <div className="font-bold text-gray-900">{game.prix_moyen}€</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Métriques détaillées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Zap size={16} className="text-yellow-500" />
                          <span className="text-sm font-medium">Énergie requise</span>
                        </div>
                        <span className="text-sm font-bold">{game.energie_requise.toFixed(1)}/5</span>
                      </div>
                      {getRatingBar(game.energie_requise)}
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Users size={16} className="text-blue-500" />
                          <span className="text-sm font-medium">Niveau social</span>
                        </div>
                        <span className="text-sm font-bold">{game.niveau_social.toFixed(1)}/5</span>
                      </div>
                      {getRatingBar(game.niveau_social)}
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Brain size={16} className="text-purple-500" />
                          <span className="text-sm font-medium">Complexité</span>
                        </div>
                        <span className="text-sm font-bold">{game.complexite.toFixed(1)}/5</span>
                      </div>
                      {getRatingBar(game.complexite)}
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Brain size={16} className="text-orange-500" />
                          <span className="text-sm font-medium">Courbe d'apprentissage</span>
                        </div>
                        <span className="text-sm font-bold">{game.courbe_apprentissage.toFixed(1)}/5</span>
                      </div>
                      {getRatingBar(game.courbe_apprentissage)}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <TrendingUp size={16} className="text-green-500" />
                          <span className="text-sm font-medium">Rejouabilité</span>
                        </div>
                        <span className="text-sm font-bold">{game.rejouabilite.toFixed(1)}/5</span>
                      </div>
                      {getRatingBar(game.rejouabilite)}
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Heart size={16} className="text-red-500" />
                          <span className="text-sm font-medium">Niveau de tension</span>
                        </div>
                        <span className="text-sm font-bold">{game.tension_niveau.toFixed(1)}/5</span>
                      </div>
                      {getRatingBar(game.tension_niveau)}
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Shield size={16} className="text-indigo-500" />
                          <span className="text-sm font-medium">Facteur chance</span>
                        </div>
                        <span className="text-sm font-bold">{game.facteur_chance.toFixed(1)}/5</span>
                      </div>
                      {getRatingBar(game.facteur_chance)}
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <AlertCircle size={16} className="text-rose-500" />
                          <span className="text-sm font-medium">Niveau de conflit</span>
                        </div>
                        <span className="text-sm font-bold">{game.niveau_conflit.toFixed(1)}/5</span>
                      </div>
                      {getRatingBar(game.niveau_conflit)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags mood */}
              {game.tags_mood && game.tags_mood.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Ambiance du jeu</h4>
                  <div className="flex flex-wrap gap-2">
                    {game.tags_mood.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Contextes adaptés */}
              {game.contextes_adaptes && game.contextes_adaptes.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Contextes adaptés</h4>
                  <div className="flex flex-wrap gap-2">
                    {game.contextes_adaptes.map((contexte, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        {contexte}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* But du jeu */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Target size={20} className="text-purple-600 mr-2" />
                  But du jeu
                </h3>
                <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                  <p className="text-purple-800 leading-relaxed">
                    {getGameObjective(game)}
                  </p>
                </div>
              </div>

              {/* Mécaniques et thèmes */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {game.mecaniques && game.mecaniques.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Mécaniques</h4>
                      <div className="flex flex-wrap gap-2">
                        {game.mecaniques.map((mecanique, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                          >
                            {mecanique}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {game.themes && game.themes.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Thèmes</h4>
                      <div className="flex flex-wrap gap-2">
                        {game.themes.map((theme, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                          >
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Points forts et points d'attention */}
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {game.points_forts && game.points_forts.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <Shield size={20} className="text-green-500 mr-2" />
                        Points forts
                      </h4>
                      <div className="space-y-2">
                        {game.points_forts.map((point, index) => (
                          <div key={index} className="flex items-center text-gray-700">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span className="text-sm">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {game.points_attention && game.points_attention.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <AlertCircle size={20} className="text-orange-500 mr-2" />
                        Points d'attention
                      </h4>
                      <div className="space-y-2">
                        {game.points_attention.map((point, index) => (
                          <div key={index} className="flex items-center text-gray-700">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span className="text-sm">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations de compatibilité (si disponibles) */}
              {game.match_explanations && game.match_explanations.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Award size={20} className="text-green-500 mr-2" />
                    Pourquoi ce jeu vous correspond
                  </h4>
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                    <ul className="space-y-2">
                      {game.match_explanations.map((explanation, index) => (
                        <li key={index} className="text-green-800 text-sm flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                          {explanation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Détails de compatibilité */}
              {game.compatibility_details && (
                <div className="p-6 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Analyse de compatibilité</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Énergie</span>
                        <span className="text-sm font-semibold">{game.compatibility_details.energy_match}/30</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Social</span>
                        <span className="text-sm font-semibold">{game.compatibility_details.social_match}/30</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Durée</span>
                        <span className={`text-sm font-semibold ${game.compatibility_details.duration_match ? 'text-green-600' : 'text-red-600'}`}>
                          {game.compatibility_details.duration_match ? '✓ Compatible' : '✗ Non adapté'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Joueurs</span>
                        <span className={`text-sm font-semibold ${game.compatibility_details.player_match ? 'text-green-600' : 'text-red-600'}`}>
                          {game.compatibility_details.player_match ? '✓ Compatible' : '✗ Non adapté'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {game.compatibility_details.tag_matches && game.compatibility_details.tag_matches.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-semibold text-gray-800 mb-2">Tags correspondants</h5>
                      <div className="flex flex-wrap gap-2">
                        {game.compatibility_details.tag_matches.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-green-100 text-green-800 hover:bg-green-200 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Conseil d'animation */}
              {game.conseil_animation && (
                <div className="p-6 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Conseil d'animation</h4>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <p className="text-blue-800 text-sm leading-relaxed">{game.conseil_animation}</p>
                  </div>
                </div>
              )}

              {/* Jeux similaires */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {game.similar_to && game.similar_to.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Similaire à</h4>
                      <div className="flex flex-wrap gap-2">
                        {game.similar_to.map((similar, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            {similar}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {game.si_vous_aimez && game.si_vous_aimez.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Si vous aimez</h4>
                      <div className="flex flex-wrap gap-2">
                        {game.si_vous_aimez.map((like, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            {like}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GameModal;