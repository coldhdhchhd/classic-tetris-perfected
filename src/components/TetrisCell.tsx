import { TetrominoType } from '@/hooks/useTetris';
import { cn } from '@/lib/utils';

interface TetrisCellProps {
  value: string | null;
  isClearing?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const CELL_COLORS: Record<TetrominoType, string> = {
  I: 'bg-tetro-i shadow-neon-cyan',
  O: 'bg-tetro-o shadow-neon-yellow',
  T: 'bg-tetro-t shadow-neon-purple',
  S: 'bg-tetro-s shadow-neon-green',
  Z: 'bg-tetro-z shadow-neon-red',
  J: 'bg-tetro-j shadow-neon-blue',
  L: 'bg-tetro-l shadow-neon-orange',
};

const GHOST_COLORS: Record<TetrominoType, string> = {
  I: 'border-tetro-i',
  O: 'border-tetro-o',
  T: 'border-tetro-t',
  S: 'border-tetro-s',
  Z: 'border-tetro-z',
  J: 'border-tetro-j',
  L: 'border-tetro-l',
};

const SIZE_CLASSES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6 sm:w-7 sm:h-7',
  lg: 'w-7 h-7 sm:w-8 sm:h-8',
};

export const TetrisCell = ({ value, isClearing, size = 'md' }: TetrisCellProps) => {
  const isGhost = value?.startsWith('ghost-');
  const pieceType = isGhost ? value?.replace('ghost-', '') as TetrominoType : value as TetrominoType;
  
  return (
    <div
      className={cn(
        'tetris-cell transition-all',
        SIZE_CLASSES[size],
        isGhost && pieceType 
          ? `ghost-cell ${GHOST_COLORS[pieceType]} bg-transparent` 
          : pieceType 
            ? `tetris-cell-filled ${CELL_COLORS[pieceType]}` 
            : 'bg-muted/10',
        isClearing && 'line-clearing'
      )}
    />
  );
};
