import { useEffect } from 'react';
import { useTetris, getThemeForLevel } from '@/hooks/useTetris';
import { TetrisBoard } from './TetrisBoard';
import { PiecePreview } from './PiecePreview';
import { ScorePanel } from './ScorePanel';
import { MobileControls } from './MobileControls';
import { GameOverlay } from './GameOverlay';
import { StarBackground } from './StarBackground';

export const TetrisGame = () => {
  const {
    board,
    nextPiece,
    holdPiece,
    canHold,
    score,
    lines,
    level,
    combo,
    gameOver,
    isPlaying,
    isPaused,
    clearingLines,
    showCombo,
    showLevelUp,
    screenShake,
    scorePop,
    startGame,
    togglePause,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
    hold,
  } = useTetris();

  const theme = getThemeForLevel(level);

  // Update CSS custom property for theme
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-hue', theme.hue.toString());
  }, [theme.hue]);

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 scanlines overflow-hidden">
      <StarBackground level={level} />

      <div className="relative z-10 w-full max-w-lg sm:max-w-none">
        {/* Title */}
        <h1 
          className="text-xl sm:text-3xl text-center mb-4 sm:mb-6 neon-text tracking-widest transition-colors duration-500"
          style={{ color: `hsl(${theme.hue} 100% 60%)` }}
        >
          TETRIS
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-start justify-center">
          {/* Left panel - Hold & Score (desktop) */}
          <div className="hidden sm:flex flex-col gap-3 w-28">
            <PiecePreview type={holdPiece} label="HOLD" disabled={!canHold} />
            <ScorePanel score={score} lines={lines} level={level} combo={combo} scorePop={scorePop} />
          </div>

          {/* Center - Game board */}
          <div className="relative" data-tetris-board>
            <TetrisBoard board={board} clearingLines={clearingLines} screenShake={screenShake} />
            <GameOverlay
              isPlaying={isPlaying}
              isPaused={isPaused}
              gameOver={gameOver}
              score={score}
              level={level}
              showCombo={showCombo}
              showLevelUp={showLevelUp}
              combo={combo}
              onStart={startGame}
            />
          </div>

          {/* Right panel - Next (desktop) */}
          <div className="hidden sm:flex flex-col gap-3 w-28">
            <PiecePreview type={nextPiece?.type || null} label="NEXT" />
            <div className="game-panel text-[8px] text-muted-foreground space-y-1">
              <p>← → Move</p>
              <p>↑ Rotate</p>
              <p>↓ Soft drop</p>
              <p>SPACE Hard drop</p>
              <p>C Hold piece</p>
              <p>P Pause</p>
            </div>
          </div>
        </div>

        {/* Mobile UI */}
        <div className="sm:hidden mt-3">
          {/* Mobile score bar */}
          <div className="flex justify-between items-center px-2 mb-2">
            <div className="flex gap-4">
              <div>
                <span className="text-[8px] text-primary block">SCORE</span>
                <span className="text-sm text-accent tabular-nums">{score.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[8px] text-primary block">LEVEL</span>
                <span className="text-sm text-secondary tabular-nums">{level}</span>
              </div>
              <div>
                <span className="text-[8px] text-primary block">LINES</span>
                <span className="text-sm tabular-nums">{lines}</span>
              </div>
            </div>
            {combo > 1 && (
              <div className="text-accent text-sm animate-pulse">x{combo}</div>
            )}
          </div>

          {/* Mobile piece previews */}
          <div className="flex justify-center gap-3 mb-2">
            <div className="flex flex-col items-center">
              <span className="text-[8px] text-muted-foreground mb-1">HOLD</span>
              <div className="game-panel p-2 opacity-80">
                <div className="w-12 h-12 flex items-center justify-center">
                  {holdPiece && <PiecePreviewMini type={holdPiece} disabled={!canHold} />}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[8px] text-muted-foreground mb-1">NEXT</span>
              <div className="game-panel p-2">
                <div className="w-12 h-12 flex items-center justify-center">
                  {nextPiece && <PiecePreviewMini type={nextPiece.type} />}
                </div>
              </div>
            </div>
          </div>

          <MobileControls
            isPlaying={isPlaying}
            isPaused={isPaused}
            gameOver={gameOver}
            onStart={startGame}
            onPause={togglePause}
            onMoveLeft={moveLeft}
            onMoveRight={moveRight}
            onMoveDown={moveDown}
            onRotate={rotate}
            onHardDrop={hardDrop}
            onHold={hold}
          />
        </div>
      </div>
    </div>
  );
};

// Mini preview for mobile
import { TetrominoType } from '@/hooks/useTetris';
import { TetrisCell } from './TetrisCell';
import { cn } from '@/lib/utils';

const TETROMINOES: Record<TetrominoType, number[][]> = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]],
};

const PiecePreviewMini = ({ type, disabled }: { type: TetrominoType; disabled?: boolean }) => {
  const shape = TETROMINOES[type];
  return (
    <div className={cn("grid gap-0", disabled && "opacity-40")} style={{ gridTemplateColumns: `repeat(${shape[0].length}, 1fr)` }}>
      {shape.map((row, y) =>
        row.map((cell, x) => (
          <div key={`${y}-${x}`} className="w-3 h-3">
            {cell ? <TetrisCell value={type} size="sm" /> : null}
          </div>
        ))
      )}
    </div>
  );
};
