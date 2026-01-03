import { TetrominoType } from '@/hooks/useTetris';
import { cn } from '@/lib/utils';

interface TetrisCellProps {
  value: TetrominoType | null;
  isClearing?: boolean;
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

export const TetrisCell = ({ value, isClearing }: TetrisCellProps) => {
  return (
    <div
      className={cn(
        'tetris-cell w-6 h-6 sm:w-7 sm:h-7',
        value ? `tetris-cell-filled ${CELL_COLORS[value]}` : 'bg-muted/20',
        isClearing && 'line-clearing'
      )}
    />
  );
};
