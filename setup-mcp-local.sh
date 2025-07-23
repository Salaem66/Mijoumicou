#!/bin/bash

echo "🔧 Configuration MCP Supabase en mode local"
echo "============================================"

# Méthode alternative : configuration locale via Claude CLI
echo "Ajout du serveur MCP Supabase localement..."

# Commande pour ajouter le serveur MCP localement
claude mcp add supabase -s local -e SUPABASE_ACCESS_TOKEN=sbp_f4a7d1e8e3b39160d6939e3b5e63dbf81a948d57 -- npx -y @supabase/mcp-server-supabase@latest

if [ $? -eq 0 ]; then
    echo "✅ Serveur MCP Supabase ajouté localement"
    echo "📋 Redémarrez Claude Code pour appliquer les changements"
else
    echo "❌ Échec de l'ajout du serveur MCP"
    echo "💡 Vous devrez peut-être installer Claude CLI d'abord"
fi

echo ""
echo "🔄 Alternatives:"
echo "1. Redémarrez complètement Claude Code"
echo "2. Vérifiez que le token Supabase est valide"
echo "3. Essayez la configuration manuelle via l'interface Supabase"