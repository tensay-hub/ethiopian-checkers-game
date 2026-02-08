import { useState, useEffect, useCallback, useMemo } from 'react';
import { Board, Player, Position, Move, GameMode, Difficulty, GameResult } from '@/types';
import { createInitialBoard, PLAYER_ONE, PLAYER_TWO } from '@/constants';
import { getValidMoves, applyMove, checkWinCondition, findCaptureMoves, getAIMove, getSuggestedMoves, getAllPlayerMoves } from '@/game/logic';
import GameBoard from '@/components/GameBoard';
import GameControls from '@/components/GameControls';
import GameOverModal from '@/components/GameOverModal';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { Howl } from 'howler';
import { motion } from 'framer-motion';

const sounds = {
  move: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'], volume: 0.5, html5: true }),
  capture: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'], volume: 0.6, html5: true }),
  win: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'], volume: 0.7, html5: true }),
  promote: new Howl({ src: ['https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'], volume: 0.5, html5: true }),
};

interface GameScreenProps {
  onBackToMenu: () => void;
  gameMode: GameMode;
  difficulty?: Difficulty;
}

const AI_PLAYER = PLAYER_TWO;

const GameScreen = ({ onBackToMenu, gameMode, difficulty }: GameScreenProps) => {
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(PLAYER_ONE);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [history, setHistory] = useState<Board[]>([createInitialBoard()]);
  const [mandatoryCaptures, setMandatoryCaptures] = useState<Move[]>([]);
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('dama-muted') === 'true';
    } catch {
      return false;
    }
  });
  const [enableSuggestions, setEnableSuggestions] = useState(() => {
    try {
      return localStorage.getItem('dama-suggestions') === 'true';
    } catch {
      return false;
    }
  });
  const [showPlayerPaths, setShowPlayerPaths] = useState(() => {
    try {
      return localStorage.getItem('dama-show-paths') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dama-muted', String(isMuted));
    } catch {}
    Object.values(sounds).forEach(s => {
      if (typeof s.mute === 'function') s.mute(isMuted);
    });
  }, [isMuted]);

  useEffect(() => {
    try {
      localStorage.setItem('dama-suggestions', String(enableSuggestions));
    } catch {}
  }, [enableSuggestions]);

  useEffect(() => {
    try {
      localStorage.setItem('dama-show-paths', String(showPlayerPaths));
    } catch {}
  }, [showPlayerPaths]);

  const isPlayerTurn = gameMode === 'single' ? currentPlayer === PLAYER_ONE : true;

  const suggestedMoves = useMemo(() => {
    if (!enableSuggestions || winner || isPaused || !isPlayerTurn) return [];
    return getSuggestedMoves(board, currentPlayer);
  }, [enableSuggestions, board, currentPlayer, winner, isPaused, isPlayerTurn]);

  const playerPaths = useMemo(() => {
    if (!showPlayerPaths || winner || isPaused || !isPlayerTurn) return [];
    return getAllPlayerMoves(board, currentPlayer);
  }, [showPlayerPaths, board, currentPlayer, winner, isPaused, isPlayerTurn]);

  const calculateScore = (winPlayer: Player, movesCount: number, currentBoard: Board) => {
    let pieceCount = 0;
    let kingCount = 0;
    
    currentBoard.forEach(row => {
      row.forEach(square => {
        if (square && square.player === winPlayer) {
          pieceCount++;
          if (square.type === 'KING') kingCount++;
        }
      });
    });

    const baseScore = (pieceCount * 100) + (kingCount * 200);
    const penalty = movesCount * 5;
    return Math.max(0, baseScore - penalty + 1000);
  };

  const performMove = useCallback((move: Move) => {
    if (!move) return;

    try {
      const { newBoard, promoted } = applyMove(board, move);
      const nextPlayer = currentPlayer === PLAYER_ONE ? PLAYER_TWO : PLAYER_ONE;

      if (move.captured && move.captured.length > 0) {
        sounds.capture.play();
      } else if (promoted) {
        sounds.promote.play();
      } else {
        sounds.move.play();
      }

      const chainedCaptures = findCaptureMoves(newBoard, currentPlayer).filter(m => 
        m.from.row === move.to.row && m.from.col === move.to.col
      );

      if (move.captured && move.captured.length > 0 && chainedCaptures.length > 0) {
        setBoard(newBoard);
        setHistory(prev => [...prev, newBoard]);
        setSelectedPiece(move.to);
        setValidMoves(chainedCaptures);
        setMandatoryCaptures(chainedCaptures);
      } else {
        setBoard(newBoard);
        setHistory(prev => [...prev, newBoard]);
        setCurrentPlayer(nextPlayer);
        setSelectedPiece(null);
        setValidMoves([]);
      }
    } catch (error) {
      console.error("Error performing move:", error);
    }
  }, [board, currentPlayer]);

  useEffect(() => {
    if (winner || isPaused) return;

    const win = checkWinCondition(board, currentPlayer);
    if (win) {
      setWinner(win);
      sounds.win.play();
      
      const movesCount = Math.floor((history.length - 1) / 2);
      const score = calculateScore(win, movesCount, board);
      
      setGameResult({
        winner: win,
        winnerName: gameMode === 'single' 
          ? (win === PLAYER_ONE ? 'Player' : 'CPU') 
          : (win === PLAYER_ONE ? 'White' : 'Black'),
        score,
        moves: movesCount,
        mode: gameMode
      });
      
      setTimeout(() => {
        setShowGameOverModal(true);
      }, 1000);
      return;
    }

    const captures = findCaptureMoves(board, currentPlayer);
    setMandatoryCaptures(captures);

    if (gameMode === 'single' && currentPlayer === AI_PLAYER) {
      const timer = setTimeout(() => {
        if (!difficulty) return;
        const aiMove = getAIMove(board, AI_PLAYER, difficulty);
        if (aiMove) {
          performMove(aiMove);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [board, currentPlayer, winner, isPaused, gameMode, difficulty, performMove, history.length]);

  const handleSquareClick = (row: number, col: number) => {
    if (winner || isPaused || !isPlayerTurn) return;

    const clickedMove = validMoves.find(move => move.to.row === row && move.to.col === col);

    if (clickedMove) {
      performMove(clickedMove);
    } else {
      const piece = board[row]?.[col];
      if (piece?.player === currentPlayer) {
        if (mandatoryCaptures.length > 0 && !mandatoryCaptures.some(m => m.from.row === row && m.from.col === col)) {
          return;
        }
        const newValidMoves = getValidMoves(board, { row, col });
        setSelectedPiece({ row, col });
        setValidMoves(newValidMoves);
      } else {
        setSelectedPiece(null);
        setValidMoves([]);
      }
    }
  };

  const handleRestart = useCallback(() => {
    const initialBoard = createInitialBoard();
    setBoard(initialBoard);
    setCurrentPlayer(PLAYER_ONE);
    setSelectedPiece(null);
    setValidMoves([]);
    setWinner(null);
    setGameResult(null);
    setShowGameOverModal(false);
    setIsPaused(false);
    setHistory([initialBoard]);
    setMandatoryCaptures([]);
  }, []);

  const handleUndo = () => {
    if (winner || history.length <= 1) return;

    const movesToUndo = (gameMode === 'single' && history.length > 2) ? 2 : 1;
    const newHistory = history.slice(0, Math.max(0, history.length - movesToUndo));
    
    if (newHistory.length === 0) {
      handleRestart();
      return;
    }

    const lastBoard = newHistory[newHistory.length - 1];
    
    setHistory(newHistory);
    setBoard(lastBoard);
    setCurrentPlayer(PLAYER_ONE); 
    setWinner(null);
    setSelectedPiece(null);
    setValidMoves([]);
    setMandatoryCaptures([]);
  };

  const getTurnIndicator = () => {
    if (winner) return 'Game Over';
    if (isPaused) return 'Paused';
    
    const playerTurn = gameMode === 'single'
      ? (currentPlayer === PLAYER_ONE ? 'Your Turn' : "AI Thinking...")
      : `${currentPlayer === PLAYER_ONE ? 'White' : 'Black'}'s Turn`;

    return playerTurn;
  };

  return (
    <div className="flex-1 w-full bg-[#1a1a1a] relative flex flex-col items-center overflow-y-auto overflow-x-hidden">
      <div className="flex-1 w-full flex flex-col items-center p-4 sm:p-6 relative z-10 selection:bg-yellow-500/30">
        {/* Header / Nav */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-6 shrink-0 z-20">
          <button 
            onClick={onBackToMenu} 
            className="flex items-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 active:scale-95 cursor-pointer text-white"
          >
            <ArrowLeft size={18} />
            <span className="hidden xs:inline font-medium text-sm">Menu</span>
          </button>

          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-bold tracking-tighter text-yellow-500 uppercase">Dama <span className="text-white/40 italic">Ethiopia</span></h1>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 active:scale-95 cursor-pointer text-white"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>

        {/* Turn Status */}
        <div className="mb-6 flex flex-col items-center shrink-0 z-20">
          <motion.div 
            key={getTurnIndicator()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-1.5 bg-yellow-500 text-black font-black uppercase text-xs sm:text-sm rounded-full shadow-[0_0_20px_rgba(234,179,8,0.2)]"
          >
            {getTurnIndicator()}
          </motion.div>
          {mandatoryCaptures.length > 0 && !winner && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-[10px] sm:text-xs mt-2 font-bold animate-pulse uppercase"
            >
              Must Capture!
            </motion.p>
          )}
        </div>

        {/* Board Container */}
        <div className="relative w-full max-w-[min(90vw,480px)] aspect-square shadow-2xl z-20 mb-8 shrink-0">
          <div className="absolute -inset-4 bg-gradient-to-br from-yellow-900/20 to-transparent rounded-3xl -z-10 blur-xl"></div>
          
          <GameBoard 
            board={board} 
            onSquareClick={handleSquareClick} 
            selectedPiece={selectedPiece} 
            validMoves={validMoves} 
            suggestedMoves={suggestedMoves}
            playerPaths={playerPaths}
            isPlayerTurn={isPlayerTurn && !winner}
          />
        </div>

        {/* Controls */}
        <div className="w-full max-w-md shrink-0 z-20">
          <GameControls 
            onRestart={handleRestart} 
            onUndo={handleUndo}
            onPause={() => setIsPaused(!isPaused)}
            onTogglePaths={() => setShowPlayerPaths(!showPlayerPaths)}
            onToggleSuggestions={() => setEnableSuggestions(!enableSuggestions)}
            isPaused={isPaused}
            canUndo={history.length > 1 && !winner}
            isPathHighlightingEnabled={showPlayerPaths}
            isSuggestionsEnabled={enableSuggestions}
          />
        </div>

        {/* Score / Stats */}
        <div className="mt-8 flex space-x-8 text-white/30 text-[10px] font-mono mb-12 shrink-0 z-20">
          <div className="flex flex-col items-center uppercase">
            <span>Moves</span>
            <span className="text-white font-bold text-sm">{Math.floor((history.length - 1) / 2)}</span>
          </div>
          <div className="flex flex-col items-center uppercase">
            <span>Mode</span>
            <span className="text-white font-bold text-sm">{gameMode === 'single' ? 'AI' : 'PvP'}</span>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <GameOverModal 
        isOpen={showGameOverModal}
        result={gameResult}
        onRestart={handleRestart}
        onBackToMenu={onBackToMenu}
        onDismiss={() => setShowGameOverModal(false)}
      />
    </div>
  );
};

export default GameScreen;