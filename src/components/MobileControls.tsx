import { useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronsDown, RotateCw, Pause, Play, RefreshCw } from 'lucide-react';

interface MobileControlsProps {
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
  onHold: () => void;
}

export const MobileControls = ({
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
  onHold,
}: MobileControlsProps) => {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastMoveRef = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isPlaying || isPaused) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, [isPlaying, isPaused]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPlaying || isPaused || !touchStartRef.current) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const now = Date.now();
    
    // Horizontal swipe threshold
    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (now - lastMoveRef.current > 80) {
        if (deltaX > 0) {
          onMoveRight();
        } else {
          onMoveLeft();
        }
        touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: now };
        lastMoveRef.current = now;
      }
    }
    
    // Downward swipe for soft drop
    if (deltaY > 40 && Math.abs(deltaY) > Math.abs(deltaX)) {
      if (now - lastMoveRef.current > 60) {
        onMoveDown();
        touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: now };
        lastMoveRef.current = now;
      }
    }
  }, [isPlaying, isPaused, onMoveLeft, onMoveRight, onMoveDown]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touchDuration = Date.now() - touchStartRef.current.time;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    // Quick tap = rotate
    if (touchDuration < 200 && Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) {
      onRotate();
    }
    
    // Fast swipe down = hard drop
    if (deltaY > 100 && touchDuration < 300 && Math.abs(deltaY) > Math.abs(deltaX) * 2) {
      onHardDrop();
    }
    
    touchStartRef.current = null;
  }, [onRotate, onHardDrop]);

  useEffect(() => {
    const board = document.querySelector('[data-tetris-board]');
    if (!board) return;

    board.addEventListener('touchstart', handleTouchStart as EventListener, { passive: false });
    board.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
    board.addEventListener('touchend', handleTouchEnd as EventListener, { passive: false });

    return () => {
      board.removeEventListener('touchstart', handleTouchStart as EventListener);
      board.removeEventListener('touchmove', handleTouchMove as EventListener);
      board.removeEventListener('touchend', handleTouchEnd as EventListener);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div className="sm:hidden w-full mt-3">
      {/* Control buttons */}
      <div className="flex gap-2 justify-center mb-3">
        {!isPlaying || gameOver ? (
          <button
            onClick={onStart}
            className="touch-btn px-6 py-3 bg-primary/30 border-primary text-primary"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            <span className="text-xs">{gameOver ? 'AGAIN' : 'START'}</span>
          </button>
        ) : (
          <button
            onClick={onPause}
            className="touch-btn px-4 py-3"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* D-pad style controls */}
      <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
        {/* Hold */}
        <button onClick={onHold} className="touch-btn py-4 text-[10px] text-muted-foreground">
          HOLD
        </button>
        
        {/* Left */}
        <button onClick={onMoveLeft} className="touch-btn py-4">
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        {/* Rotate + Hard Drop */}
        <div className="flex flex-col gap-1">
          <button onClick={onRotate} className="touch-btn py-2 flex-1">
            <RotateCw className="w-5 h-5" />
          </button>
          <button onClick={onHardDrop} className="touch-btn py-2 flex-1 bg-primary/20 border-primary/50">
            <ChevronsDown className="w-5 h-5 text-primary" />
          </button>
        </div>
        
        {/* Right */}
        <button onClick={onMoveRight} className="touch-btn py-4">
          <ChevronRight className="w-6 h-6" />
        </button>
        
        {/* Down */}
        <button onClick={onMoveDown} className="touch-btn py-4">
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      <p className="text-[8px] text-center text-muted-foreground mt-3">
        Tap board to rotate • Swipe to move • Swipe down fast to drop
      </p>
    </div>
  );
};
