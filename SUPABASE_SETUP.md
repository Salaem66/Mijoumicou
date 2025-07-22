# Configuration Supabase - Society Games Helper

## 1. Création du projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte et un nouveau projet
3. Attendez que le projet soit complètement initialisé

## 2. Configuration de la base de données

### Étape 1: Exécuter le schéma SQL
1. Allez dans l'onglet **SQL Editor** de votre projet Supabase
2. Copiez tout le contenu du fichier `database/supabase-schema.sql`
3. Collez-le dans l'éditeur SQL et exécutez le script
4. Vérifiez que toutes les tables ont été créées dans l'onglet **Table Editor**

### Étape 2: Configurer l'authentification
1. Allez dans **Authentication > Settings**
2. Activez l'inscription par email
3. Configurez les templates d'email si nécessaire
4. Dans **Authentication > Policies**, vérifiez que les Row Level Security sont actives

## 3. Migration des données existantes

### Option A: Migration automatique (Recommandée)
```bash
# Installer les dépendances
npm install @supabase/supabase-js

# Configurer les variables d'environnement
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Lancer la migration
node database/migrate-to-supabase.js
```

### Option B: Migration manuelle
1. Allez dans **Table Editor > games**
2. Cliquez sur **Insert > Insert row**
3. Ajoutez manuellement quelques jeux pour tester

## 4. Configuration Frontend

### Étape 1: Variables d'environnement
1. Copiez `.env.example` vers `.env` dans le dossier `frontend/`
2. Remplacez les valeurs par celles de votre projet:

```bash
# frontend/.env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

**⚠️ Important**: Utilisez la clé `anon/public` pour le frontend, pas la `service_role` !

### Étape 2: Récupérer les clés
1. **URL du projet**: Disponible dans **Settings > General**
2. **Clé anonyme**: Dans **Settings > API** - `anon public`
3. **Clé service_role**: Dans **Settings > API** - `service_role` (pour la migration seulement)

## 5. Test de l'intégration

### Tests de base
1. Démarrez le frontend: `cd frontend && npm start`
2. Ouvrez la console développeur (F12)
3. Vérifiez qu'il n'y a pas d'erreurs de connexion Supabase

### Tests d'authentification
1. Cliquez sur "Se connecter" dans l'interface
2. Créez un compte de test
3. Vérifiez dans **Authentication > Users** que l'utilisateur apparaît

### Tests de données
1. Vérifiez que les jeux s'affichent correctement
2. Testez une recherche d'humeur
3. Si connecté, testez l'ajout à la bibliothèque

## 6. Fonctionnalités activées

### ✅ Déjà implémentées
- [x] Structure de base de données complète
- [x] Authentification (inscription/connexion/déconnexion)
- [x] Profils utilisateur automatiques
- [x] Services Supabase (GameService, LibraryService, etc.)
- [x] Types TypeScript pour la base de données
- [x] Composants d'authentification (AuthForm, AuthModal)
- [x] Hook personnalisé useAuth
- [x] Migration des données existantes

### 🚧 À intégrer dans l'interface
- [ ] Intégration du AuthProvider dans App.tsx
- [ ] Boutons de connexion/déconnexion dans l'interface
- [ ] Bibliothèque personnelle (page dédiée)
- [ ] Historique des recherches
- [ ] Favoris
- [ ] Profil utilisateur

## 7. Prochaines étapes

1. **Intégrer l'authentification** dans l'interface existante
2. **Migrer l'API partagée** pour utiliser Supabase au lieu du JSON
3. **Créer les pages utilisateur** (bibliothèque, historique, profil)
4. **Tester en production** sur Netlify avec les variables d'environnement

## 8. Sécurité et bonnes pratiques

### Row Level Security (RLS)
- ✅ Activée sur toutes les tables utilisateur
- ✅ Policies configurées pour que chaque utilisateur ne voit que ses données
- ✅ Pas d'accès direct aux données sensibles

### Variables d'environnement
- ✅ Clés séparées pour développement/production
- ✅ Service role uniquement pour les scripts de migration
- ✅ Anon key pour l'application frontend

### Base de données
- ✅ Contraintes et validations sur les champs
- ✅ Index pour les performances
- ✅ Timestamps automatiques
- ✅ UUID pour les identifiants sensibles

## 9. Support et dépannage

### Problèmes courants

**Erreur de connexion à Supabase**
- Vérifiez que les variables d'environnement sont correctes
- Vérifiez que le projet Supabase est bien actif
- Redémarrez le serveur de développement après avoir changé `.env`

**Tables non créées**
- Vérifiez que le script SQL s'est exécuté sans erreur
- Regardez les logs dans l'onglet SQL Editor
- Assurez-vous d'avoir les permissions admin

**Authentification ne fonctionne pas**
- Vérifiez que l'inscription par email est activée
- Regardez les logs dans **Authentication > Logs**
- Vérifiez les RLS policies

### Logs utiles
- **Supabase Dashboard > Logs**: Tous les logs de la base
- **Authentication > Logs**: Logs d'authentification
- **Console navigateur**: Erreurs frontend
- **Network tab**: Requêtes vers l'API Supabase

---

📧 **Besoin d'aide ?** Consultez la [documentation Supabase](https://supabase.com/docs) ou créez un ticket sur GitHub.