import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface StartPageProps {
  onStart: () => void;
}

const StartPage: React.FC<StartPageProps> = ({ onStart }) => {
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
              Vous ne savez pas quel jeu nul choisir pour votre soirée entre amis&nbsp;?
            </p>
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mt-2">
              Heureusement qu'on est là&nbsp;<span className="text-2xl">:)</span>
            </p>
          </motion.div>

          {/* Bouton Commencer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="pt-8"
          >
            <Button
              onClick={onStart}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Commencer
              <ArrowRight size={20} className="ml-2" />
            </Button>
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