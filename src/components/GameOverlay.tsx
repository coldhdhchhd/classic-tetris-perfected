import { cn } from '@/lib/utils';

interface GameOverlayProps {
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  score: number;
  level: number;
  showCombo: boolean;
  showLevelUp: boolean;
  combo: number;
  onStart: () => void;
}

export const GameOverlay = ({
  isPlaying,
  isPaused,
  gameOver,
  score,
  level,
  showCombo,
  showLevelUp,
  combo,
  onStart,
}: GameOverlayProps) => {
  if (isPlaying && !gameOver && !isPaused) {
    return (
      <>
        {/* Combo notification */}
        {showCombo && combo > 1 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="combo-flash text-2xl text-accent neon-text font-bold">
              {combo}x COMBO!
            </div>
          </div>
        )}
        
        {/* Level up notification */}
        {showLevelUp && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="level-up-flash text-xl text-secondary neon-text font-bold">
              LEVEL {level}!
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-20">
      <div className="text-center px-4">
        {gameOver ? (
          <>
            <p className="text-2xl text-destructive neon-text mb-3">GAME OVER</p>
            <p className="text-sm text-foreground mb-1">Final Score</p>
            <p className="text-xl text-accent mb-4">{score.toLocaleString()}</p>
            <button
              onClick={onStart}
              className="px-6 py-3 bg-primary/20 hover:bg-primary/40 border border-primary text-primary transition-all text-xs pulse-glow"
            >
              PLAY AGAIN
            </button>
          </>
        ) : isPaused ? (
          <>
            <p className="text-2xl text-secondary neon-text mb-4">PAUSED</p>
            <p className="text-xs text-muted-foreground">Press P or tap to resume</p>
          </>
        ) : (
          <>
            <p className="text-2xl text-primary neon-text mb-4">TETRIS</p>
            <button
              onClick={onStart}
              className="px-8 py-4 bg-primary/20 hover:bg-primary/40 border-2 border-primary text-primary transition-all text-sm pulse-glow"
            >
              START GAME
            </button>
            <p className="text-[8px] text-muted-foreground mt-4 hidden sm:block">
              ← → Move • ↑ Rotate • Space Drop • C Hold
            </p>
          </>
        )}
      </div>
    </div>
  );
};
