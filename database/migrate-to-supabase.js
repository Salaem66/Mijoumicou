const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (à remplacer par vos vraies valeurs)
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateGamesData() {
  try {
    console.log('🚀 Début de la migration des données vers Supabase...');

    // Charger les données JSON existantes
    const gamesPath = path.join(__dirname, '../api/games_data.json');
    const gamesData = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));

    console.log(`📊 ${gamesData.length} jeux trouvés dans le fichier JSON`);

    // Nettoyer et préparer les données pour PostgreSQL
    const cleanedGames = gamesData.map(game => ({
      // Champs de base
      nom: game.nom,
      nom_anglais: game.nom_anglais || null,
      description_courte: game.description_courte || null,
      description_complete: game.description_complete || null,
      
      // Joueurs et durée
      joueurs_min: parseInt(game.joueurs_min) || 1,
      joueurs_max: parseInt(game.joueurs_max) || 8,
      joueurs_ideal: game.joueurs_ideal ? parseInt(game.joueurs_ideal) : null,
      duree_min: game.duree_min ? parseInt(game.duree_min) : null,
      duree_max: game.duree_max ? parseInt(game.duree_max) : null,
      duree_moyenne: parseInt(game.duree_moyenne) || 60,
      
      // Autres caractéristiques
      age_minimum: game.age_minimum ? parseInt(game.age_minimum) : null,
      complexite: game.complexite ? Math.round(parseFloat(game.complexite)) : 3,
      prix_moyen: game.prix_moyen ? parseInt(game.prix_moyen) : null,
      type_principal: game.type_principal || null,
      
      // Arrays PostgreSQL
      mecaniques: Array.isArray(game.mecaniques) ? game.mecaniques : [],
      themes: Array.isArray(game.themes) ? game.themes : [],
      tags_mood: Array.isArray(game.tags_mood) ? game.tags_mood : [],
      contextes_adaptes: Array.isArray(game.contextes_adaptes) ? game.contextes_adaptes : [],
      points_forts: Array.isArray(game.points_forts) ? game.points_forts : [],
      points_faibles: Array.isArray(game.points_faibles || game.points_attention) ? 
        (game.points_faibles || game.points_attention) : [],
      
      // Scores d'humeur (convertis en entiers 1-5)
      energie_requise: Math.round(parseFloat(game.energie_requise)) || 3,
      niveau_social: Math.round(parseFloat(game.niveau_social)) || 3,
      facteur_chance: Math.round(parseFloat(game.facteur_chance)) || 3,
      tension_niveau: Math.round(parseFloat(game.tension_niveau)) || 3,
      courbe_apprentissage: Math.round(parseFloat(game.courbe_apprentissage)) || 3,
      rejouabilite: Math.round(parseFloat(game.rejouabilite)) || 3,
      niveau_conflit: Math.round(parseFloat(game.niveau_conflit)) || 3
    }));

    console.log('🧹 Données nettoyées et converties');

    // Insérer par batch pour éviter les timeouts
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < cleanedGames.length; i += batchSize) {
      const batch = cleanedGames.slice(i, i + batchSize);
      
      try {
        const { data, error } = await supabase
          .from('games')
          .insert(batch)
          .select();

        if (error) {
          console.error(`❌ Erreur batch ${Math.floor(i/batchSize) + 1}:`, error);
          errorCount += batch.length;
        } else {
          console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} inséré: ${data.length} jeux`);
          successCount += data.length;
        }
      } catch (err) {
        console.error(`❌ Erreur lors de l'insertion du batch ${Math.floor(i/batchSize) + 1}:`, err);
        errorCount += batch.length;
      }
    }

    console.log('\n📈 Résultats de la migration:');
    console.log(`✅ Succès: ${successCount} jeux`);
    console.log(`❌ Erreurs: ${errorCount} jeux`);
    console.log(`📊 Total traité: ${successCount + errorCount}/${gamesData.length} jeux`);

    // Vérifier que les données ont été insérées
    const { count } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true });

    console.log(`\n🎯 Vérification: ${count} jeux présents dans Supabase`);

    if (count === gamesData.length) {
      console.log('🎉 Migration complète réussie !');
    } else {
      console.log('⚠️ Il y a une différence dans le nombre de jeux. Vérifiez les erreurs.');
    }

  } catch (error) {
    console.error('💥 Erreur critique lors de la migration:', error);
    process.exit(1);
  }
}

async function createIndexes() {
  console.log('\n🔧 Création d\'indexes supplémentaires...');
  
  // Note: Les indexes principaux sont déjà dans le schema SQL
  // Ici on peut ajouter des indexes spécifiques pour les recherches
  
  try {
    // Index pour la recherche texte
    await supabase.rpc('create_text_search_index');
    console.log('✅ Index de recherche texte créé');
  } catch (error) {
    console.log('ℹ️ Index de recherche texte déjà existant ou erreur:', error.message);
  }
}

// Script principal
async function main() {
  if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.error('❌ Veuillez configurer SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY');
    console.log('💡 Exemple:');
    console.log('export SUPABASE_URL="https://your-project.supabase.co"');
    console.log('export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
    process.exit(1);
  }

  console.log(`🔗 Connexion à Supabase: ${supabaseUrl}`);
  
  await migrateGamesData();
  await createIndexes();
  
  console.log('\n🏁 Migration terminée avec succès !');
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { migrateGamesData, createIndexes };