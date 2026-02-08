import { GameMode, Difficulty } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronRight, Brain, Zap, ShieldAlert } from 'lucide-react';

interface MainMenuProps {
  onSelectMode: (mode: GameMode, difficulty?: Difficulty) => void;
}

const MainMenu = ({ onSelectMode }: MainMenuProps) => {
  const [showDifficulty, setShowDifficulty] = useState(false);

  const difficulties: { id: Difficulty; label: string; icon: any; color: string; desc: string }[] = [
    { id: 'easy', label: 'Easy', icon: Zap, color: 'text-green-400', desc: 'Basic moves' },
    { id: 'medium', label: 'Medium', icon: Brain, color: 'text-blue-400', desc: 'Strategic play' },
    { id: 'hard', label: 'Hard', icon: ShieldAlert, color: 'text-red-500', desc: 'Grandmaster level' },
  ];

  return (
    <div className="flex-1 w-full bg-[#121212] relative flex flex-col items-center overflow-y-auto overflow-x-hidden">
      {/* Background Decoration */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-yellow-900/10 rounded-full blur-3xl z-0 pointer-events-none"></div>

      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-full p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16 relative z-10"
        >
          <h1 className="text-7xl sm:text-8xl font-black text-yellow-500 tracking-tighter italic drop-shadow-2xl uppercase">Dama</h1>
          <p className="text-xl sm:text-2xl text-white/40 font-light tracking-[0.5em] mt-[-10px] ml-2 uppercase">Ethiopia</p>
        </motion.div>

        <div className="w-full max-w-xs space-y-4 relative z-20">
          <AnimatePresence mode="wait">
            {!showDifficulty ? (
              <motion.div
                key="main-options"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <button
                  onClick={() => setShowDifficulty(true)}
                  className="w-full group relative flex items-center justify-between px-8 py-5 bg-white text-black font-black text-xl rounded-2xl hover:bg-yellow-500 transition-all overflow-hidden shadow-2xl active:scale-95 cursor-pointer border-none"
                >
                  <span className="relative z-10 uppercase">Single Player</span>
                  <ChevronRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-yellow-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>

                <button
                  onClick={() => onSelectMode('two')}
                  className="w-full group relative flex items-center justify-center px-8 py-5 bg-white/5 text-white font-black text-xl rounded-2xl hover:bg-white/10 transition-all overflow-hidden border border-white/10 shadow-2xl active:scale-95 cursor-pointer"
                >
                  <span className="relative z-10 uppercase">Multiplayer</span>
                  <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="difficulty-options"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <p className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase mb-4 text-center">Select Difficulty</p>
                {difficulties.map((diff) => (
                  <button
                    key={diff.id}
                    onClick={() => onSelectMode('single', diff.id)}
                    className="w-full group relative flex items-center p-4 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition-all border border-white/5 shadow-xl active:scale-95 cursor-pointer"
                  >
                    <div className={`p-3 rounded-xl bg-white/5 mr-4 ${diff.color}`}>
                      <diff.icon size={20} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-black text-lg uppercase leading-none">{diff.label}</span>
                      <span className="text-white/30 text-[10px] font-medium uppercase mt-1">{diff.desc}</span>
                    </div>
                    <ChevronRight className="ml-auto text-white/20 group-hover:text-white transition-colors" size={16} />
                  </button>
                ))}
                
                <button
                  onClick={() => setShowDifficulty(false)}
                  className="w-full mt-4 text-white/30 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors py-2"
                >
                  Back
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className='mt-16 pb-8 text-center text-white/20 text-[10px] font-bold tracking-[0.3em] uppercase z-10 shrink-0'>
          <p>Traditional Game Culture</p>
        </footer>
      </div>
    </div>
  );
};

export default MainMenu;