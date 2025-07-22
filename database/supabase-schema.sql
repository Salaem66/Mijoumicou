-- Society Games Helper - Schema Supabase
-- Configuration de la base de données PostgreSQL

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des jeux (migration depuis games_data.json)
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    nom_anglais VARCHAR(255),
    description_courte TEXT,
    description_complete TEXT,
    joueurs_min INTEGER NOT NULL DEFAULT 1,
    joueurs_max INTEGER NOT NULL DEFAULT 8,
    joueurs_ideal INTEGER,
    duree_min INTEGER,
    duree_max INTEGER,
    duree_moyenne INTEGER NOT NULL DEFAULT 60,
    age_minimum INTEGER DEFAULT 8,
    complexite INTEGER DEFAULT 3 CHECK (complexite >= 1 AND complexite <= 5),
    prix_moyen INTEGER,
    type_principal VARCHAR(100),
    mecaniques TEXT[], -- Array de mécaniques
    themes TEXT[], -- Array de thèmes
    
    -- Scores d'humeur (1-5)
    energie_requise INTEGER DEFAULT 3 CHECK (energie_requise >= 1 AND energie_requise <= 5),
    niveau_social INTEGER DEFAULT 3 CHECK (niveau_social >= 1 AND niveau_social <= 5),
    facteur_chance INTEGER DEFAULT 3 CHECK (facteur_chance >= 1 AND facteur_chance <= 5),
    tension_niveau INTEGER DEFAULT 3 CHECK (tension_niveau >= 1 AND tension_niveau <= 5),
    courbe_apprentissage INTEGER DEFAULT 3 CHECK (courbe_apprentissage >= 1 AND courbe_apprentissage <= 5),
    rejouabilite INTEGER DEFAULT 3 CHECK (rejouabilite >= 1 AND rejouabilite <= 5),
    niveau_conflit INTEGER DEFAULT 3 CHECK (niveau_conflit >= 1 AND niveau_conflit <= 5),
    
    tags_mood TEXT[], -- Tags pour l'analyse d'humeur
    contextes_adaptes TEXT[],
    points_forts TEXT[],
    points_faibles TEXT[],
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index pour les recherches
CREATE INDEX idx_games_type ON games(type_principal);
CREATE INDEX idx_games_complexite ON games(complexite);
CREATE INDEX idx_games_duree ON games(duree_moyenne);
CREATE INDEX idx_games_joueurs ON games(joueurs_min, joueurs_max);

-- Table des profils utilisateur (extends auth.users)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    
    -- Préférences de jeu
    complexity_preference INTEGER DEFAULT 3 CHECK (complexity_preference >= 1 AND complexity_preference <= 5),
    duration_preference INTEGER DEFAULT 60, -- minutes préférées
    player_count_preference INTEGER DEFAULT 4,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Table des bibliothèques personnelles
CREATE TABLE user_libraries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    UNIQUE(user_id, game_id)
);

-- RLS pour les bibliothèques
ALTER TABLE user_libraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own library" ON user_libraries
    FOR ALL USING (auth.uid() = user_id);

-- Index pour les bibliothèques
CREATE INDEX idx_user_libraries_user ON user_libraries(user_id);
CREATE INDEX idx_user_libraries_game ON user_libraries(game_id);

-- Table de l'historique des recherches
CREATE TABLE search_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mood_query TEXT NOT NULL,
    mood_analysis JSONB,
    recommendations JSONB,
    search_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS pour l'historique
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own search history" ON search_history
    FOR ALL USING (auth.uid() = user_id);

-- Index pour l'historique
CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_date ON search_history(search_date DESC);

-- Table des favoris
CREATE TABLE user_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    favorited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(user_id, game_id)
);

-- RLS pour les favoris
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- Index pour les favoris
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_game ON user_favorites(game_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vues utiles
CREATE OR REPLACE VIEW user_library_with_games AS
SELECT 
    ul.*,
    g.nom,
    g.description_courte,
    g.complexite,
    g.duree_moyenne,
    g.joueurs_min,
    g.joueurs_max
FROM user_libraries ul
JOIN games g ON ul.game_id = g.id;

CREATE OR REPLACE VIEW popular_games AS
SELECT 
    g.*,
    COUNT(ul.user_id) as library_count,
    COUNT(uf.user_id) as favorite_count
FROM games g
LEFT JOIN user_libraries ul ON g.id = ul.game_id
LEFT JOIN user_favorites uf ON g.id = uf.game_id
GROUP BY g.id
ORDER BY library_count + favorite_count DESC;

-- Insertion des données de démonstration (quelques jeux pour tester)
-- Ces données seront remplacées par la migration complète du JSON
INSERT INTO games (
    nom, nom_anglais, description_courte, description_complete,
    joueurs_min, joueurs_max, joueurs_ideal, duree_min, duree_max, duree_moyenne,
    age_minimum, complexite, type_principal,
    energie_requise, niveau_social, facteur_chance, tension_niveau,
    courbe_apprentissage, rejouabilite, niveau_conflit,
    tags_mood, points_forts, points_faibles
) VALUES (
    'Perudo', 'Perudo', 
    'Jeu de bluff ancestral avec des dés, parfait pour révéler la vraie personnalité de vos amis.',
    'Perudo est un jeu de bluff ancestral où vous devez mentir avec aplomb pour éliminer vos adversaires. Cachez vos dés, annoncez des combinaisons (vraies ou fausses) et défiez les autres joueurs. Parfait pour révéler la vraie personnalité de vos amis ! Un classique qui transforme n''importe qui en menteur professionnel le temps d''une partie.',
    2, 6, 4, 20, 45, 30,
    8, 2, 'bluff',
    4, 5, 4, 4, 2, 4, 3,
    ARRAY['bluff', 'social', 'rigolo', 'merde', 'con'],
    ARRAY['Facile à apprendre', 'Très social', 'Portable'],
    ARRAY['Demande du bluff', 'Peut créer des tensions']
);

COMMENT ON TABLE games IS 'Table principale des jeux avec leurs caractéristiques et scores d''humeur';
COMMENT ON TABLE user_profiles IS 'Profils utilisateur étendant auth.users avec préférences de jeu';
COMMENT ON TABLE user_libraries IS 'Bibliothèques personnelles des utilisateurs';
COMMENT ON TABLE search_history IS 'Historique des recherches d''humeur des utilisateurs';
COMMENT ON TABLE user_favorites IS 'Jeux favoris des utilisateurs';