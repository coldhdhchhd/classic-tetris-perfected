import { Board } from '@/hooks/useTetris';
import { TetrisCell } from './TetrisCell';

interface TetrisBoardProps {
  board: Board;
  clearingLines: number[];
}

export const TetrisBoard = ({ board, clearingLines }: TetrisBoardProps) => {
  return (
    <div className="arcade-border p-1 bg-background/50">
      <div className="grid grid-cols-10 gap-0">
        {board.map((row, y) =>
          row.map((cell, x) => (
            <TetrisCell
              key={`${y}-${x}`}
              value={cell}
              isClearing={clearingLines.includes(y)}
            />
          ))
        )}
      </div>
    </div>
  );
};
