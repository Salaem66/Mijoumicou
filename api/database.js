const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class AdvancedDatabase {
  constructor() {
    this.db = new sqlite3.Database(':memory:');
    this.initializeDatabase();
  }

  initializeDatabase() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE games (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nom TEXT NOT NULL,
          nom_anglais TEXT NOT NULL,
          description_courte TEXT NOT NULL,
          description_complete TEXT NOT NULL,
          joueurs_min INTEGER NOT NULL,
          joueurs_max INTEGER NOT NULL,
          joueurs_ideal INTEGER NOT NULL,
          duree_min INTEGER NOT NULL,
          duree_max INTEGER NOT NULL,
          duree_moyenne INTEGER NOT NULL,
          age_minimum INTEGER NOT NULL,
          complexite REAL NOT NULL,
          prix_moyen REAL NOT NULL,
          type_principal TEXT NOT NULL,
          mecaniques TEXT NOT NULL,
          themes TEXT NOT NULL,
          energie_requise REAL NOT NULL,
          niveau_social REAL NOT NULL,
          facteur_chance REAL NOT NULL,
          tension_niveau REAL NOT NULL,
          courbe_apprentissage REAL NOT NULL,
          rejouabilite REAL NOT NULL,
          niveau_conflit REAL NOT NULL,
          tags_mood TEXT NOT NULL,
          contextes_adaptes TEXT NOT NULL,
          points_forts TEXT NOT NULL,
          points_faibles TEXT NOT NULL,
          conseil_animation TEXT,
          similar_to TEXT,
          si_vous_aimez TEXT
        )
      `);

      this.populateGamesFromJSON();
    });
  }

  populateGamesFromJSON() {
    try {
      const gamesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'games_data.json'), 'utf8'));
      
      const stmt = this.db.prepare(`
        INSERT INTO games (
          nom, nom_anglais, description_courte, description_complete,
          joueurs_min, joueurs_max, joueurs_ideal,
          duree_min, duree_max, duree_moyenne,
          age_minimum, complexite, prix_moyen,
          type_principal, mecaniques, themes,
          energie_requise, niveau_social, facteur_chance,
          tension_niveau, courbe_apprentissage, rejouabilite, niveau_conflit,
          tags_mood, contextes_adaptes,
          points_forts, points_faibles, conseil_animation,
          similar_to, si_vous_aimez
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const games = Array.isArray(gamesData) ? gamesData : gamesData.games;
      games.forEach(game => {
        stmt.run(
          game.nom,
          game.nom_anglais,
          game.description_courte,
          game.description_complete,
          game.joueurs_min,
          game.joueurs_max,
          game.joueurs_ideal,
          game.duree_min,
          game.duree_max,
          game.duree_moyenne,
          game.age_minimum,
          game.complexite,
          game.prix_moyen,
          game.type_principal,
          JSON.stringify(game.mecaniques),
          JSON.stringify(game.themes),
          game.energie_requise,
          game.niveau_social,
          game.facteur_chance,
          game.tension_niveau,
          game.courbe_apprentissage,
          game.rejouabilite,
          game.niveau_conflit,
          JSON.stringify(game.tags_mood),
          JSON.stringify(game.contextes_adaptes),
          JSON.stringify(game.points_forts),
          JSON.stringify(game.points_faibles),
          game.conseil_animation,
          JSON.stringify(game.similar_to),
          JSON.stringify(game.si_vous_aimez)
        );
      });

      stmt.finalize();
    } catch (error) {
      console.log('JSON file not found, using fallback data');
      this.populateFallbackGames();
    }
  }

  populateFallbackGames() {
    const fallbackGames = [
      {
        nom: "Azul",
        nom_anglais: "Azul",
        description_courte: "Placez astucieusement vos azulejos colorés pour créer les plus beaux motifs et marquer un maximum de points.",
        description_complete: "Dans Azul, vous incarnez un artisan chargé de décorer les murs du palais royal. Chaque tour, vous sélectionnez des tuiles colorées parmi celles disposées au centre, puis vous les placez stratégiquement sur votre plateau personnel. L'objectif est de compléter des lignes et des colonnes pour marquer des points, tout en évitant le gaspillage qui vous pénaliserait. Ce jeu allie réflexion tactique et plaisir esthétique.",
        joueurs_min: 2,
        joueurs_max: 4,
        joueurs_ideal: 3,
        duree_min: 30,
        duree_max: 60,
        duree_moyenne: 45,
        age_minimum: 8,
        complexite: 2.3,
        prix_moyen: 35,
        type_principal: "famille",
        energie_requise: 2.5,
        niveau_social: 2.0,
        facteur_chance: 2.0,
        tension_niveau: 2.5,
        courbe_apprentissage: 2.0,
        rejouabilite: 4.0,
        niveau_conflit: 2.0,
        tags_mood: ["zen mais stimulant", "apéro décontracté", "découvrir tranquillement", "soirée qui s'éternise"],
        contextes_adaptes: ["debut_soiree", "famille_avec_enfants", "couple", "entre_gamers"],
        points_forts: ["Règles simples mais choix tactiques", "Matériel magnifique", "Tension équilibrée"],
        points_faibles: ["Peut frustrer si on rate son timing", "Interaction limitée"],
        conseil_animation: "Insistez sur la beauté du matériel et la satisfaction tactile des tuiles."
      },
      {
        nom: "Perudo",
        nom_anglais: "Perudo",
        description_courte: "Bluffez et mentez effrontément dans ce jeu de dés et de poker menteur péruvien.",
        description_complete: "Perudo est un jeu de bluff ancestral où vous devez mentir avec aplomb pour éliminer vos adversaires. Cachez vos dés, annoncez des combinaisons (vraies ou fausses) et défiez les autres joueurs. Parfait pour révéler la vraie personnalité de vos amis ! Un classique qui transforme n'importe qui en menteur professionnel le temps d'une partie.",
        joueurs_min: 2,
        joueurs_max: 6,
        joueurs_ideal: 4,
        duree_min: 15,
        duree_max: 30,
        duree_moyenne: 20,
        age_minimum: 8,
        complexite: 1.5,
        prix_moyen: 25,
        type_principal: "ambiance",
        energie_requise: 3.5,
        niveau_social: 4.5,
        facteur_chance: 4.0,
        tension_niveau: 3.5,
        courbe_apprentissage: 1.5,
        rejouabilite: 4.5,
        niveau_conflit: 3.0,
        tags_mood: ["fun", "bluff", "rigoler", "chaos", "nul", "con", "menteur", "énergique"],
        contextes_adaptes: ["entre amis", "apéro", "soirée décontractée", "fin de soirée"],
        points_forts: ["Règles ultra simples", "Révèle la vraie nature des gens", "Hilarant", "Rejouable à l'infini"],
        points_faibles: ["Certains détestent mentir", "Peut créer des tensions", "Trop simple pour certains"],
        conseil_animation: "Encouragez les joueurs à bien jouer leur rôle de menteur. Plus c'est théâtral, plus c'est drôle !"
      }
    ];

    const stmt = this.db.prepare(`
      INSERT INTO games (
        nom, nom_anglais, description_courte, description_complete,
        joueurs_min, joueurs_max, joueurs_ideal,
        duree_min, duree_max, duree_moyenne,
        age_minimum, complexite, prix_moyen,
        type_principal, mecaniques, themes,
        energie_requise, niveau_social, facteur_chance,
        tension_niveau, courbe_apprentissage, rejouabilite, niveau_conflit,
        tags_mood, contextes_adaptes,
        points_forts, points_faibles, conseil_animation,
        similar_to, si_vous_aimez
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    fallbackGames.forEach(game => {
      stmt.run(
        game.nom,
        game.nom_anglais,
        game.description_courte,
        game.description_complete,
        game.joueurs_min,
        game.joueurs_max,
        game.joueurs_ideal,
        game.duree_min,
        game.duree_max,
        game.duree_moyenne,
        game.age_minimum,
        game.complexite,
        game.prix_moyen,
        game.type_principal,
        '["placement", "collection"]',
        '["abstrait", "artistique"]',
        game.energie_requise,
        game.niveau_social,
        game.facteur_chance,
        game.tension_niveau,
        game.courbe_apprentissage,
        game.rejouabilite,
        game.niveau_conflit,
        JSON.stringify(game.tags_mood),
        JSON.stringify(game.contextes_adaptes),
        JSON.stringify(game.points_forts),
        JSON.stringify(game.points_faibles),
        game.conseil_animation,
        '["Sagrada", "Patchwork"]',
        '["Si vous aimez les puzzles abstraits", "Si vous aimez Tetris"]'
      );
    });

    stmt.finalize();
  }

  getAllGames() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM games", (err, rows) => {
        if (err) reject(err);
        else {
          const parsedRows = rows.map(row => ({
            ...row,
            mecaniques: JSON.parse(row.mecaniques),
            themes: JSON.parse(row.themes),
            tags_mood: JSON.parse(row.tags_mood),
            contextes_adaptes: JSON.parse(row.contextes_adaptes),
            points_forts: JSON.parse(row.points_forts),
            points_faibles: JSON.parse(row.points_faibles),
            similar_to: JSON.parse(row.similar_to || '[]'),
            si_vous_aimez: JSON.parse(row.si_vous_aimez || '[]')
          }));
          resolve(parsedRows);
        }
      });
    });
  }

  searchGamesByMoodAdvanced(moodCriteria) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT *, 
          (CASE 
            WHEN ABS(energie_requise - ?) <= 1 THEN 3
            WHEN ABS(energie_requise - ?) <= 2 THEN 1
            ELSE 0
          END +
          CASE 
            WHEN ABS(niveau_social - ?) <= 1 THEN 3
            WHEN ABS(niveau_social - ?) <= 2 THEN 1
            ELSE 0
          END +
          CASE 
            WHEN ABS(facteur_chance - ?) <= 1 THEN 2
            WHEN ABS(facteur_chance - ?) <= 2 THEN 1
            ELSE 0
          END +
          CASE 
            WHEN ABS(tension_niveau - ?) <= 1 THEN 2
            WHEN ABS(tension_niveau - ?) <= 2 THEN 1
            ELSE 0
          END +
          CASE 
            WHEN duree_moyenne BETWEEN ? AND ? THEN 3
            WHEN duree_moyenne BETWEEN ? AND ? THEN 1
            ELSE 0
          END +
          CASE 
            WHEN joueurs_min <= ? AND joueurs_max >= ? THEN 3
            ELSE 0
          END
          ) as mood_score
        FROM games
        WHERE mood_score > 5
        ORDER BY mood_score DESC, rejouabilite DESC
        LIMIT 5
      `;

      const params = [
        moodCriteria.energie_requise, moodCriteria.energie_requise,
        moodCriteria.niveau_social, moodCriteria.niveau_social,
        moodCriteria.facteur_chance, moodCriteria.facteur_chance,
        moodCriteria.tension_niveau, moodCriteria.tension_niveau,
        moodCriteria.duree_min, moodCriteria.duree_max,
        moodCriteria.duree_min - 30, moodCriteria.duree_max + 30,
        moodCriteria.joueurs_ideal, moodCriteria.joueurs_ideal
      ];

      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else {
          const parsedRows = rows.map(row => ({
            ...row,
            mecaniques: JSON.parse(row.mecaniques),
            themes: JSON.parse(row.themes),
            tags_mood: JSON.parse(row.tags_mood),
            contextes_adaptes: JSON.parse(row.contextes_adaptes),
            points_forts: JSON.parse(row.points_forts),
            points_faibles: JSON.parse(row.points_faibles),
            similar_to: JSON.parse(row.similar_to || '[]'),
            si_vous_aimez: JSON.parse(row.si_vous_aimez || '[]')
          }));
          resolve(parsedRows);
        }
      });
    });
  }

  searchByTags(tags) {
    return new Promise((resolve, reject) => {
      const tagConditions = tags.map(() => "tags_mood LIKE ?").join(" OR ");
      const query = `
        SELECT * FROM games 
        WHERE ${tagConditions}
        ORDER BY rejouabilite DESC
        LIMIT 10
      `;
      
      const searchTerms = tags.map(tag => `%${tag}%`);
      
      this.db.all(query, searchTerms, (err, rows) => {
        if (err) reject(err);
        else {
          const parsedRows = rows.map(row => ({
            ...row,
            mecaniques: JSON.parse(row.mecaniques),
            themes: JSON.parse(row.themes),
            tags_mood: JSON.parse(row.tags_mood),
            contextes_adaptes: JSON.parse(row.contextes_adaptes),
            points_forts: JSON.parse(row.points_forts),
            points_faibles: JSON.parse(row.points_faibles),
            similar_to: JSON.parse(row.similar_to || '[]'),
            si_vous_aimez: JSON.parse(row.si_vous_aimez || '[]')
          }));
          resolve(parsedRows);
        }
      });
    });
  }

  getGamesByType(type) {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT * FROM games WHERE type_principal = ? ORDER BY complexite ASC",
        [type],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  getGamesByContext(context) {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT * FROM games WHERE contextes_adaptes LIKE ? ORDER BY rejouabilite DESC",
        [`%${context}%`],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Ajouter un nouveau jeu à la base de données
  addGame(gameData) {
    return new Promise((resolve, reject) => {
      // Générer un nouvel ID
      this.db.get(
        "SELECT MAX(id) as maxId FROM games",
        [],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          
          const newId = (row.maxId || 0) + 1;
          
          const stmt = this.db.prepare(`
            INSERT INTO games (
              id, nom, nom_anglais, description_courte, description_complete,
              joueurs_min, joueurs_max, joueurs_ideal,
              duree_min, duree_max, duree_moyenne,
              age_minimum, complexite, prix_moyen,
              type_principal, mecaniques, themes,
              energie_requise, niveau_social, facteur_chance,
              tension_niveau, courbe_apprentissage, rejouabilite, niveau_conflit,
              tags_mood, contextes_adaptes,
              points_forts, points_faibles, conseil_animation,
              similar_to, si_vous_aimez
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          try {
            stmt.run(
              newId,
              gameData.nom,
              gameData.nom_anglais || gameData.nom,
              gameData.description_courte,
              gameData.description_complete,
              gameData.joueurs_min,
              gameData.joueurs_max,
              gameData.joueurs_ideal,
              gameData.duree_min,
              gameData.duree_max,
              gameData.duree_moyenne,
              gameData.age_minimum,
              gameData.complexite,
              gameData.prix_moyen || 0,
              gameData.type_principal,
              JSON.stringify(gameData.mecaniques || []),
              JSON.stringify(gameData.themes || []),
              gameData.energie_requise,
              gameData.niveau_social,
              gameData.facteur_chance,
              gameData.tension_niveau,
              gameData.courbe_apprentissage,
              gameData.rejouabilite,
              gameData.niveau_conflit,
              JSON.stringify(gameData.tags_mood || []),
              JSON.stringify(gameData.contextes_adaptes || []),
              JSON.stringify(gameData.points_forts || []),
              JSON.stringify(gameData.points_faibles || []),
              gameData.conseil_animation || null,
              JSON.stringify(gameData.similar_to || []),
              JSON.stringify(gameData.si_vous_aimez || [])
            );
            
            stmt.finalize();
            resolve({ id: newId, ...gameData });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  // Mettre à jour un jeu existant
  updateGame(id, gameData) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        UPDATE games SET
          nom = ?, nom_anglais = ?, description_courte = ?, description_complete = ?,
          joueurs_min = ?, joueurs_max = ?, joueurs_ideal = ?,
          duree_min = ?, duree_max = ?, duree_moyenne = ?,
          age_minimum = ?, complexite = ?, prix_moyen = ?,
          type_principal = ?, mecaniques = ?, themes = ?,
          energie_requise = ?, niveau_social = ?, facteur_chance = ?,
          tension_niveau = ?, courbe_apprentissage = ?, rejouabilite = ?, niveau_conflit = ?,
          tags_mood = ?, contextes_adaptes = ?,
          points_forts = ?, points_faibles = ?, conseil_animation = ?,
          similar_to = ?, si_vous_aimez = ?
        WHERE id = ?
      `);
      
      try {
        stmt.run(
          gameData.nom,
          gameData.nom_anglais || gameData.nom,
          gameData.description_courte,
          gameData.description_complete,
          gameData.joueurs_min,
          gameData.joueurs_max,
          gameData.joueurs_ideal,
          gameData.duree_min,
          gameData.duree_max,
          gameData.duree_moyenne,
          gameData.age_minimum,
          gameData.complexite,
          gameData.prix_moyen || 0,
          gameData.type_principal,
          JSON.stringify(gameData.mecaniques || []),
          JSON.stringify(gameData.themes || []),
          gameData.energie_requise,
          gameData.niveau_social,
          gameData.facteur_chance,
          gameData.tension_niveau,
          gameData.courbe_apprentissage,
          gameData.rejouabilite,
          gameData.niveau_conflit,
          JSON.stringify(gameData.tags_mood || []),
          JSON.stringify(gameData.contextes_adaptes || []),
          JSON.stringify(gameData.points_forts || []),
          JSON.stringify(gameData.points_faibles || []),
          gameData.conseil_animation || null,
          JSON.stringify(gameData.similar_to || []),
          JSON.stringify(gameData.si_vous_aimez || []),
          id
        );
        
        stmt.finalize();
        resolve({ id, ...gameData });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Supprimer un jeu
  deleteGame(id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "DELETE FROM games WHERE id = ?",
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ deletedId: id, changes: this.changes });
        }
      );
    });
  }
}

module.exports = AdvancedDatabase;