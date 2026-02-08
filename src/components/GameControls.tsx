import { RotateCcw, Undo, Play, Pause, Footprints, Lightbulb } from 'lucide-react';

interface GameControlsProps {
    onRestart: () => void;
    onUndo: () => void;
    onPause: () => void;
    onTogglePaths: () => void;
    onToggleSuggestions: () => void;
    isPaused: boolean;
    canUndo: boolean;
    isPathHighlightingEnabled: boolean;
    isSuggestionsEnabled: boolean;
}

const GameControls = ({ 
    onRestart, 
    onUndo, 
    onPause, 
    onTogglePaths,
    onToggleSuggestions,
    isPaused, 
    canUndo,
    isPathHighlightingEnabled,
    isSuggestionsEnabled
}: GameControlsProps) => {
  return (
    <div className="grid grid-cols-5 gap-2 w-full">
      <button 
        onClick={onUndo} 
        disabled={!canUndo} 
        className="flex flex-col items-center justify-center py-3 px-1 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 disabled:opacity-20 disabled:cursor-not-allowed group"
        title="Undo Move"
      >
        <Undo size={18} className="mb-1 group-active:-rotate-45 transition-transform text-yellow-500" />
        <span className="text-[9px] uppercase font-bold tracking-tight text-white/60">Undo</span>
      </button>

      <button 
        onClick={onToggleSuggestions} 
        className={`flex flex-col items-center justify-center py-3 px-1 rounded-2xl transition-all border group ${
            isSuggestionsEnabled ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'
        }`}
        title="Toggle Suggestions"
      >
        <Lightbulb size={18} className={`mb-1 transition-transform ${isSuggestionsEnabled ? 'text-yellow-400 scale-110' : 'text-white/40'}`} />
        <span className={`text-[9px] uppercase font-bold tracking-tight ${isSuggestionsEnabled ? 'text-yellow-400' : 'text-white/60'}`}>Hints</span>
      </button>

      <button 
        onClick={onTogglePaths} 
        className={`flex flex-col items-center justify-center py-3 px-1 rounded-2xl transition-all border group ${
            isPathHighlightingEnabled ? 'bg-green-500/20 border-green-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'
        }`}
        title="Show Player Paths"
      >
        <Footprints size={18} className={`mb-1 transition-transform ${isPathHighlightingEnabled ? 'text-green-400 scale-110' : 'text-white/40'}`} />
        <span className={`text-[9px] uppercase font-bold tracking-tight ${isPathHighlightingEnabled ? 'text-green-400' : 'text-white/60'}`}>Paths</span>
      </button>

      <button 
        onClick={onPause} 
        className="flex flex-col items-center justify-center py-3 px-1 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 group"
        title={isPaused ? 'Resume' : 'Pause'}
      >
        {isPaused ? (
            <Play size={18} className="mb-1 text-green-500 fill-green-500/20" />
        ) : (
            <Pause size={18} className="mb-1 text-white" />
        )}
        <span className="text-[9px] uppercase font-bold tracking-tight text-white/60">
            {isPaused ? 'Resume' : 'Pause'}
        </span>
      </button>

      <button 
        onClick={onRestart} 
        className="flex flex-col items-center justify-center py-3 px-1 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 group"
        title="Restart Game"
      >
        <RotateCcw size={18} className="mb-1 group-hover:rotate-180 transition-transform duration-500 text-red-400" />
        <span className="text-[9px] uppercase font-bold tracking-tight text-white/60">Reset</span>
      </button>
    </div>
  );
};

export default GameControls;