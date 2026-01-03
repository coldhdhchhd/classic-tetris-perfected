import { Board } from '@/hooks/useTetris';
import { TetrisCell } from './TetrisCell';
import { cn } from '@/lib/utils';

interface TetrisBoardProps {
  board: Board;
  clearingLines: number[];
  screenShake: boolean;
}

export const TetrisBoard = ({ board, clearingLines, screenShake }: TetrisBoardProps) => {
  return (
    <div className={cn("arcade-border p-1 bg-background/50", screenShake && "shake")}>
      <div className="grid grid-cols-10 gap-0">
        {board.map((row, y) =>
          row.map((cell, x) => (
            <TetrisCell
              key={`${y}-${x}`}
              value={cell}
              isClearing={clearingLines.includes(y)}
              size="md"
            />
          ))
        )}
      </div>
    </div>
  );
};
