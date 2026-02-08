import { Board, Position, Move } from '@/types';
import GamePiece from './GamePiece';
import { motion } from 'framer-motion';

interface GameBoardProps {
  board: Board;
  onSquareClick: (row: number, col: number) => void;
  selectedPiece: Position | null;
  validMoves: Move[];
  suggestedMoves?: Move[];
  playerPaths?: Move[];
  isPlayerTurn?: boolean;
}

const GameBoard = ({ 
  board, 
  onSquareClick, 
  selectedPiece, 
  validMoves, 
  suggestedMoves = [], 
  playerPaths = [],
  isPlayerTurn = true 
}: GameBoardProps) => {
  const isSuggested = (row: number, col: number) => {
    return suggestedMoves.some(move => move.to.row === row && move.to.col === col);
  };

  const isPieceSuggested = (row: number, col: number) => {
    return suggestedMoves.some(move => move.from.row === row && move.from.col === col);
  };

  const isPathNode = (row: number, col: number) => {
    return playerPaths.some(move => move.to.row === row && move.to.col === col);
  };

  const isPathSource = (row: number, col: number) => {
    return playerPaths.some(move => move.from.row === row && move.from.col === col);
  };

  return (
    <div className={`grid grid-cols-8 w-full h-full border-[8px] sm:border-[12px] border-[#3d2b1f] bg-[#2a1b10] shadow-2xl rounded-xl overflow-hidden relative ${isPlayerTurn ? '' : 'cursor-wait'}`}>
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] z-10"></div>
      
      {board.map((row, rowIndex) =>
        row.map((square, colIndex) => {
          const isPlayable = (rowIndex + colIndex) % 2 === 1;
          const isSelected = selectedPiece && selectedPiece.row === rowIndex && selectedPiece.col === colIndex;
          const isMoveSuggested = isSuggested(rowIndex, colIndex);
          const isStartSuggested = isPieceSuggested(rowIndex, colIndex);
          const isPathTarget = isPathNode(rowIndex, colIndex);
          const isPathOrigin = isPathSource(rowIndex, colIndex);

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onSquareClick(rowIndex, colIndex)}
              className={`relative flex items-center justify-center aspect-square transition-colors duration-300 ${
                isPlayable ? 'bg-[#3d2b1f]' : 'bg-[#d2b48c]'
              } ${isSelected ? 'bg-yellow-500/20' : ''} ${
                isPlayable && isPlayerTurn ? 'cursor-pointer' : ''
              }`}
            >
              {/* Highlight for selected square */}
              {isSelected && (
                <motion.div 
                  layoutId="selection-glow"
                  className="absolute inset-0 bg-yellow-500/30 z-0"
                />
              )}

              {/* Player Path Origin Highlight */}
              {!isSelected && isPathOrigin && isPlayerTurn && (
                <div className="absolute inset-0 border-2 border-dashed border-green-500/30 z-0" />
              )}

              {/* Suggestion Glow for Start Square */}
              {!isSelected && isStartSuggested && !isPathOrigin && isPlayerTurn && (
                <motion.div 
                  animate={{ opacity: [0.1, 0.4, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-blue-500/30 z-0"
                />
              )}

              {/* Coordinate hints (subtle) */}
              {colIndex === 0 && (
                <span className={`absolute top-0.5 left-0.5 text-[8px] font-bold opacity-30 ${isPlayable ? 'text-white' : 'text-black'}`}>
                  {8 - rowIndex}
                </span>
              )}
              {rowIndex === 7 && (
                <span className={`absolute bottom-0.5 right-0.5 text-[8px] font-bold opacity-30 ${isPlayable ? 'text-white' : 'text-black'}`}>
                  {String.fromCharCode(97 + colIndex)}
                </span>
              )}

              {/* Valid Move Indicators (Yellow Dots) removed as per request */}

              {/* Player Path Target Indicator */}
              {isPathTarget && isPlayerTurn && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-1 border-2 border-dashed border-green-500/60 rounded-lg z-10"
                />
              )}

              {/* Suggestion Indicator for Target Square */}
              {isMoveSuggested && !isPathTarget && isPlayerTurn && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className='w-3 h-3 sm:w-5 sm:h-5 rounded-full bg-blue-400/40 border-2 border-blue-200/30 z-20 shadow-[0_0_10px_rgba(96,165,250,0.5)]'
                  />
              )}

              {/* Piece */}
              {square && (
                <div className="w-full h-full flex items-center justify-center z-20">
                   <GamePiece piece={square} isSelected={isSelected} />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default GameBoard;