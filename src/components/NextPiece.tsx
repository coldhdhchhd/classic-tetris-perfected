import { Tetromino } from '@/hooks/useTetris';
import { TetrisCell } from './TetrisCell';

interface NextPieceProps {
  piece: Tetromino | null;
}

export const NextPiece = ({ piece }: NextPieceProps) => {
  const gridSize = 4;
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));

  if (piece) {
    const offsetY = Math.floor((gridSize - piece.shape.length) / 2);
    const offsetX = Math.floor((gridSize - piece.shape[0].length) / 2);
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          grid[y + offsetY][x + offsetX] = piece.type;
        }
      }
    }
  }

  return (
    <div className="game-panel">
      <h3 className="text-xs text-primary neon-text mb-3">NEXT</h3>
      <div className="grid grid-cols-4 gap-0 w-fit">
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div key={`${y}-${x}`} className="w-5 h-5">
              {cell ? <TetrisCell value={cell} /> : <div className="w-5 h-5" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
