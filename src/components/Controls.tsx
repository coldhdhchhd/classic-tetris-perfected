interface ControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  onStart: () => void;
  onPause: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
}

export const Controls = ({
  isPlaying,
  isPaused,
  gameOver,
  onStart,
  onPause,
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onHardDrop,
}: ControlsProps) => {
  return (
    <div className="game-panel">
      <h3 className="text-xs text-primary neon-text mb-3">CONTROLS</h3>
      
      {!isPlaying || gameOver ? (
        <button
          onClick={onStart}
          className="w-full py-2 px-4 bg-primary/20 hover:bg-primary/40 border border-primary text-primary transition-all duration-200 text-xs pulse-glow"
        >
          {gameOver ? 'PLAY AGAIN' : 'START GAME'}
        </button>
      ) : (
        <button
          onClick={onPause}
          className="w-full py-2 px-4 bg-secondary/20 hover:bg-secondary/40 border border-secondary text-secondary transition-all duration-200 text-xs"
        >
          {isPaused ? 'RESUME' : 'PAUSE'}
        </button>
      )}

      {/* Mobile controls */}
      <div className="mt-4 sm:hidden">
        <div className="grid grid-cols-3 gap-2">
          <div />
          <button
            onClick={onRotate}
            className="py-3 bg-muted/30 active:bg-muted/50 border border-border text-foreground text-xs"
          >
            ↑
          </button>
          <div />
          <button
            onClick={onMoveLeft}
            className="py-3 bg-muted/30 active:bg-muted/50 border border-border text-foreground text-xs"
          >
            ←
          </button>
          <button
            onClick={onHardDrop}
            className="py-3 bg-primary/30 active:bg-primary/50 border border-primary text-primary text-xs"
          >
            ⬇
          </button>
          <button
            onClick={onMoveRight}
            className="py-3 bg-muted/30 active:bg-muted/50 border border-border text-foreground text-xs"
          >
            →
          </button>
          <div />
          <button
            onClick={onMoveDown}
            className="py-3 bg-muted/30 active:bg-muted/50 border border-border text-foreground text-xs"
          >
            ↓
          </button>
          <div />
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="mt-4 text-[8px] text-muted-foreground space-y-1 hidden sm:block">
        <p>← → : MOVE</p>
        <p>↑ : ROTATE</p>
        <p>↓ : SOFT DROP</p>
        <p>SPACE : HARD DROP</p>
        <p>P/ESC : PAUSE</p>
      </div>
    </div>
  );
};
