import { useState, useCallback } from 'react';
import MainMenu from './screens/MainMenu';
import GameScreen from './screens/GameScreen';
import { GameMode, Difficulty } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing'>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('two');
  const [difficulty, setDifficulty] = useState<Difficulty>();

  const handleSelectMode = useCallback((mode: GameMode, difficultyLevel?: Difficulty) => {
    setGameMode(mode);
    setDifficulty(difficultyLevel);
    setGameState('playing');
  }, []);

  const handleBackToMenu = useCallback(() => {
    setGameState('menu');
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#121212] text-white font-sans flex flex-col relative overflow-x-hidden">
      <AnimatePresence mode="wait">
        {gameState === 'menu' ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 w-full flex flex-col"
          >
            <MainMenu onSelectMode={handleSelectMode} />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 w-full flex flex-col"
          >
            <GameScreen 
              onBackToMenu={handleBackToMenu} 
              gameMode={gameMode} 
              difficulty={difficulty} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;