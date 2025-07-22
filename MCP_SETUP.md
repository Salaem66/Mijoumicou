# Configuration MCP Supabase - Society Games Helper

Le serveur MCP (Model Context Protocol) de Supabase permet à Claude Code d'interagir directement avec votre base de données Supabase pour créer les tables, migrer les données, et bien plus.

## 🚀 Étapes de configuration

### 1. Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte si nécessaire
3. Cliquez sur **"New project"**
4. Choisissez votre organisation
5. Donnez un nom : `society-games-helper`
6. Générez un mot de passe fort pour la base de données
7. Sélectionnez une région proche de vous
8. Cliquez **"Create new project"**

### 2. Récupérer le token d'accès personnel
1. Allez sur [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Cliquez sur **"Generate new token"**
3. Donnez un nom : `Claude Code MCP`
4. Sélectionnez les permissions nécessaires :
   - `projects:read`
   - `projects:write` 
   - `database:read`
   - `database:write`
5. Copiez le token généré (vous ne pourrez plus le voir après)

### 3. Configurer le MCP dans ce projet
1. Ouvrez le fichier `.mcp.json` dans ce projet
2. Remplacez `YOUR_SUPABASE_ACCESS_TOKEN_HERE` par votre token
3. Sauvegardez le fichier

### 4. Redémarrer Claude Code
1. Fermez complètement Claude Code
2. Rouvrez Claude Code
3. Le serveur MCP Supabase sera automatiquement connecté

## 🎯 Avantages du MCP

Avec le MCP configuré, Claude peut directement :
- ✅ Créer et modifier les tables de la base de données
- ✅ Exécuter les scripts SQL de migration
- ✅ Insérer les données des jeux automatiquement
- ✅ Créer les indexes et optimisations
- ✅ Configurer les Row Level Security policies
- ✅ Tester les requêtes directement

## 📋 Configuration finale

Le fichier `.mcp.json` configuré ressemble à ceci :

```json
{
  "servers": [
    {
      "name": "supabase",
      "command": "npx",
      "args": [
        "@supabase/mcp-server-supabase@latest"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_votre_token_ici..."
      }
    }
  ]
}
```

## 🔒 Sécurité

- ⚠️ **Ne commitez jamais le token** dans git
- 📝 Le `.mcp.json` est déjà dans `.gitignore`
- 🔐 Utilisez un token avec permissions minimales
- 🚫 Ne connectez jamais à une base de production

## ✅ Vérification

Une fois configuré, vous devriez voir dans Claude Code :
- Les outils MCP Supabase disponibles
- Possibilité de créer et gérer les tables
- Accès aux données de votre projet Supabase

## 🆘 Dépannage

**Le MCP ne fonctionne pas ?**
- Vérifiez que le token est correct et n'a pas expiré
- Redémarrez complètement Claude Code
- Vérifiez que npx est installé (`npm install -g npx`)

**Permissions insuffisantes ?**
- Retournez sur supabase.com/dashboard/account/tokens
- Régénérez un token avec plus de permissions

---

Une fois configuré, dites-moi "**MCP configuré**" et je pourrai directement créer votre base de données et migrer toutes vos données automatiquement ! 🎉