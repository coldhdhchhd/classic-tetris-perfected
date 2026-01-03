import { useTetris } from '@/hooks/useTetris';
import { TetrisBoard } from './TetrisBoard';
import { NextPiece } from './NextPiece';
import { ScorePanel } from './ScorePanel';
import { Controls } from './Controls';

export const TetrisGame = () => {
  const {
    board,
    nextPiece,
    score,
    lines,
    level,
    gameOver,
    isPlaying,
    isPaused,
    clearingLines,
    startGame,
    togglePause,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop,
  } = useTetris();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 scanlines">
      {/* Background grid effect */}
      <div 
        className="fixed inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10">
        {/* Title */}
        <h1 className="text-2xl sm:text-4xl text-center mb-6 neon-text text-primary tracking-wider">
          TETRIS
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 items-start justify-center">
          {/* Left panel - Score (desktop) */}
          <div className="hidden sm:block w-32">
            <ScorePanel score={score} lines={lines} level={level} />
          </div>

          {/* Center - Game board */}
          <div className="relative">
            <TetrisBoard board={board} clearingLines={clearingLines} />
            
            {/* Overlay for game states */}
            {(!isPlaying || gameOver || isPaused) && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  {gameOver ? (
                    <>
                      <p className="text-xl text-destructive neon-text mb-2">GAME OVER</p>
                      <p className="text-sm text-muted-foreground mb-4">Score: {score}</p>
                    </>
                  ) : isPaused ? (
                    <p className="text-xl text-secondary neon-text">PAUSED</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Press START or ENTER</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-4 w-full sm:w-32">
            {/* Mobile score row */}
            <div className="sm:hidden">
              <div className="game-panel flex justify-between">
                <div>
                  <span className="text-[8px] text-primary">SCORE</span>
                  <p className="text-sm text-accent">{score}</p>
                </div>
                <div>
                  <span className="text-[8px] text-primary">LINES</span>
                  <p className="text-sm">{lines}</p>
                </div>
                <div>
                  <span className="text-[8px] text-primary">LEVEL</span>
                  <p className="text-sm text-secondary">{level}</p>
                </div>
              </div>
            </div>

            <NextPiece piece={nextPiece} />
            <Controls
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};
