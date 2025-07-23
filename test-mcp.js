#!/usr/bin/env node

// Script de test pour diagnostiquer le MCP Supabase
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic MCP Supabase');
console.log('==========================\n');

// 1. Vérifier l'existence du fichier .mcp.json
const mcpPath = path.join(__dirname, '.mcp.json');
console.log('1. Vérification du fichier .mcp.json:');
if (fs.existsSync(mcpPath)) {
  console.log('   ✅ Fichier .mcp.json trouvé');
  const config = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
  console.log('   📋 Configuration:', JSON.stringify(config, null, 2));
} else {
  console.log('   ❌ Fichier .mcp.json non trouvé');
  process.exit(1);
}

// 2. Tester l'installation du package
console.log('\n2. Test d\'installation du package:');
const testInstall = spawn('npx', ['-y', '@supabase/mcp-server-supabase@0.4.5', '--version'], {
  stdio: 'pipe'
});

let installOutput = '';
testInstall.stdout.on('data', (data) => {
  installOutput += data.toString();
});

testInstall.stderr.on('data', (data) => {
  console.log('   ⚠️ Erreur stderr:', data.toString());
});

testInstall.on('close', (code) => {
  if (code === 0) {
    console.log('   ✅ Package installé, version:', installOutput.trim());
  } else {
    console.log('   ❌ Échec de l\'installation, code:', code);
  }
  
  // 3. Tester l'exécution directe
  console.log('\n3. Test d\'exécution directe:');
  const testRun = spawn('npx', [
    '-y', 
    '@supabase/mcp-server-supabase@0.4.5'
  ], {
    env: { 
      ...process.env, 
      SUPABASE_ACCESS_TOKEN: 'sbp_f4a7d1e8e3b39160d6939e3b5e63dbf81a948d57' 
    },
    stdio: 'pipe'
  });

  let runOutput = '';
  let runError = '';
  
  testRun.stdout.on('data', (data) => {
    runOutput += data.toString();
  });
  
  testRun.stderr.on('data', (data) => {
    runError += data.toString();
  });
  
  setTimeout(() => {
    testRun.kill();
    console.log('   📤 Sortie stdout:', runOutput || 'Aucune sortie');
    console.log('   📥 Sortie stderr:', runError || 'Aucune erreur');
    
    // 4. Recommandations
    console.log('\n4. Recommandations:');
    console.log('   💡 Assurez-vous que Claude Code est complètement redémarré');
    console.log('   💡 Vérifiez que le token Supabase est valide');
    console.log('   💡 Essayez de renommer .mcp.json temporairement et redémarrer');
    
    process.exit(0);
  }, 3000);
});