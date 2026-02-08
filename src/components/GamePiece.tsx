import { Piece } from '@/types';
import { Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface GamePieceProps {
  piece: Piece;
  isSelected?: boolean;
}

const GamePiece = ({ piece, isSelected }: GamePieceProps) => {
  if (!piece || !piece.player) {
    return null;
  }

  const isWhite = piece.player === 'WHITE';
  
  // Custom styling for pieces to look like real Dama pieces
  const pieceClasses = isWhite 
    ? 'bg-gradient-to-br from-stone-100 to-stone-400 border-stone-300 shadow-[0_4px_0_0_#a8a29e]' 
    : 'bg-gradient-to-br from-neutral-800 to-neutral-950 border-neutral-700 shadow-[0_4px_0_0_#171717]';

  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isSelected ? 1.05 : 1,
        opacity: 1,
        y: isSelected ? -2 : 0
      }}
      whileHover={{ scale: 1.05 }}
      className={`relative w-[85%] h-[85%] rounded-full border-2 flex items-center justify-center transition-shadow ${pieceClasses} ${isSelected ? 'shadow-[0_8px_20px_rgba(234,179,8,0.4)]' : ''}`}
    >
      {/* Piece Inset Ring (Decorative) */}
      <div className={`absolute inset-1.5 rounded-full border opacity-20 ${isWhite ? 'border-black' : 'border-white'}`}></div>
      <div className={`absolute inset-2.5 rounded-full border opacity-10 ${isWhite ? 'border-black' : 'border-white'}`}></div>
      
      {piece.type === 'KING' && (
        <motion.div
            initial={{ rotate: -45, scale: 0.5 }}
            animate={{ rotate: 0, scale: 1 }}
        >
            <Crown 
                size={18} 
                className={isWhite ? 'text-neutral-700 fill-neutral-700/20' : 'text-stone-300 fill-stone-300/20'} 
                strokeWidth={3}
            />
        </motion.div>
      )}

      {/* Glossy highlight */}
      <div className="absolute top-[15%] left-[15%] w-[15%] h-[15%] bg-white/30 rounded-full blur-[1px]"></div>
    </motion.div>
  );
};

export default GamePiece;