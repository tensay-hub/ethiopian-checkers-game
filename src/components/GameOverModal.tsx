import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCcw, Home, BarChart2, X } from 'lucide-react';
import ReactConfetti from 'react-confetti';
import { useEffect, useState } from 'react';
import { GameResult } from '@/types';

interface GameOverModalProps {
  isOpen: boolean;
  result: GameResult | null;
  onRestart: () => void;
  onBackToMenu: () => void;
  onDismiss: () => void;
}

const GameOverModal = ({ isOpen, result, onRestart, onBackToMenu, onDismiss }: GameOverModalProps) => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!result) return null;

  // Show confetti if it's a win for White (Player 1) or in PvP mode
  const isVictory = result.mode === 'single' ? result.winner === 'WHITE' : true;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Confetti */}
          {isOpen && isVictory && (
            <ReactConfetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={500}
              gravity={0.15}
              colors={['#EAB308', '#FFFFFF', '#3d2b1f', '#d2b48c']}
            />
          )}

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDismiss}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#2a1b10] border-4 border-yellow-600/50 rounded-3xl shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center"
          >
            {/* Close Button */}
            <button
              onClick={onDismiss}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* Cultural Pattern Header */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-yellow-500 to-green-600" />

            {/* Icon */}
            <motion.div
              initial={{ rotate: -10, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(234,179,8,0.4)]"
            >
              <Trophy size={48} className="text-[#2a1b10]" />
            </motion.div>

            {/* Announcement Heading */}
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">
              {result.winner === 'WHITE' ? 'White Wins!' : 'Black Wins!'}
            </h2>
            
            {/* Winning Entity Subtext (Player/CPU or Mode info) */}
            <p className="text-yellow-500 font-bold text-xl mb-8 uppercase tracking-widest">
              {result.mode === 'single' ? result.winnerName : 'Victory'}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 w-full mb-8">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-white/40 text-xs uppercase font-bold mb-1">Final Score</p>
                <p className="text-2xl font-black text-white">{result.score}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-white/40 text-xs uppercase font-bold mb-1">Total Moves</p>
                <p className="text-2xl font-black text-white">{result.moves}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col w-full gap-3">
              <button
                onClick={onRestart}
                className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-[#2a1b10] font-black rounded-2xl flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-yellow-900/20"
              >
                <RefreshCcw size={20} />
                PLAY AGAIN
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={onBackToMenu}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 flex items-center justify-center gap-2 transition-all"
                >
                  <Home size={18} />
                  MENU
                </button>
                <button
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 flex items-center justify-center gap-2 transition-all opacity-50 cursor-not-allowed"
                  title="Scoreboard coming soon"
                >
                  <BarChart2 size={18} />
                  STATS
                </button>
              </div>
            </div>

            {/* Cultural Pattern Footer */}
            <div className="mt-8 flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-yellow-600/20" />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GameOverModal;