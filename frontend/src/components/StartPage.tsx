import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface StartPageProps {
  onStart: () => void;
  onCeliaDemo?: (mood: string) => void;
}

const StartPage: React.FC<StartPageProps> = ({ onStart, onCeliaDemo }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Titre principal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center space-x-4 mb-6"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Sparkles size={32} className="text-white" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Mijoumicou
            </h1>
          </motion.div>

          {/* Sous-titre */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
              Est-ce que ça va nous rendre millionnaires??? 
            </p>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
              Je vais pouvoir acheter une boulangerie???
            </p>
          </motion.div>

          {/* Boutons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="pt-8 space-y-4"
          >
            <div>
              <Button
                onClick={onStart}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Commencer
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
            
            {/* Bouton démo spécial pour Célia */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <Button
                onClick={() => {
                  // Animation spéciale pour Célia
                  const celiaDemo = document.createElement('div');
                  celiaDemo.innerHTML = `
                    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                                background: rgba(0,0,0,0.9); z-index: 9999; display: flex; 
                                align-items: center; justify-content: center; color: white;">
                      <div style="text-align: center; max-width: 600px; padding: 2rem;">
                        <h1 style="font-size: 3rem; margin-bottom: 2rem; background: linear-gradient(45deg, #ff6b6b, #4ecdc4); 
                                   -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                           Célia,
                        </h1>
                        <p style="font-size: 1.5rem; margin-bottom: 2rem; line-height: 1.6;">
                          Tu te rappelles ce que tu m'as dit après avoir commandé ton Salamèche, avec la boîte de Maudit Mot Dit dans les mains, juste avant de te faire détruire au Sling Hockey ???<br><br>
                          Bah voilà... C'est ça... 
                        </p>
                        <button onclick="this.parentElement.parentElement.remove(); window.startCeliaDemo();" 
                                style="background: linear-gradient(45deg, #ff6b6b, #4ecdc4); 
                                       border: none; color: white; padding: 1rem 2rem; 
                                       border-radius: 50px; font-size: 1.2rem; cursor: pointer;">
                          Zé parti
                        </button>
                      </div>
                    </div>
                  `;
                  document.body.appendChild(celiaDemo);
                  
                  // Définir la fonction de démo
                  (window as any).startCeliaDemo = () => {
                    onStart();
                    
                    setTimeout(() => {
                      // Auto-remplir avec un exemple spécial pour Célia (animation visuelle)
                      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                      if (textarea) {
                        const celiaExample = "Je cherche un jeu de MERDE qui ne plaît uniquement qu'à un gros CON";
                        let i = 0;
                        
                        // Reset initial
                        textarea.value = "";
                        textarea.dispatchEvent(new Event('input', { bubbles: true }));
                        
                        const typeWriter = () => {
                          if (i < celiaExample.length) {
                            const currentText = celiaExample.substring(0, i + 1);
                            
                            // Mise à jour visuelle du textarea
                            textarea.value = currentText;
                            textarea.focus();
                            
                            // Forcer React à détecter le changement
                            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
                            if (nativeInputValueSetter) {
                              nativeInputValueSetter.call(textarea, currentText);
                            }
                            
                            // Déclencher les événements React
                            textarea.dispatchEvent(new Event('input', { bubbles: true }));
                            textarea.dispatchEvent(new Event('change', { bubbles: true }));
                            
                            i++;
                            setTimeout(typeWriter, 120);
                          } else {
                            // Une fois l'animation terminée, attendre un peu puis utiliser le callback
                            setTimeout(() => {
                              console.log('🎪 Animation terminée, déclenchement via callback...');
                              // Marquer que c'est une démo pour éviter la préservation du texte
                              (window as any).isDemoActive = true;
                              if (onCeliaDemo) {
                                onCeliaDemo(celiaExample);
                              }
                              // Désactiver le marqueur après l'analyse pour permettre l'effacement au clic
                              setTimeout(() => {
                                delete (window as any).isDemoActive;
                              }, 3000);
                            }, 1000);
                          }
                        };
                        
                        // Commencer la frappe après un petit délai
                        setTimeout(typeWriter, 500);
                      }
                    }, 1000);
                  };
                }}
                variant="outline"
                className="border-2 border-pink-400 text-pink-600 hover:bg-pink-50 hover:border-pink-500 px-6 py-3 rounded-xl font-medium transform hover:scale-105 transition-all duration-200"
              >
                <Sparkles size={18} className="mr-2" />
                Démo spéciale pour #C
              </Button>
            </motion.div>
          </motion.div>

          {/* Éléments décoratifs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="absolute inset-0 overflow-hidden pointer-events-none"
          >
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-500"></div>
            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-700"></div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default StartPage;