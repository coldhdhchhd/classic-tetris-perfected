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

interface PiecePreviewProps {
  type: TetrominoType | null;
  label: string;
  disabled?: boolean;
}

export const PiecePreview = ({ type, label, disabled }: PiecePreviewProps) => {
  const gridSize = 4;
  const grid: (TetrominoType | null)[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));

  if (type) {
    const shape = TETROMINOES[type];
    const offsetY = Math.floor((gridSize - shape.length) / 2);
    const offsetX = Math.floor((gridSize - shape[0].length) / 2);
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          grid[y + offsetY][x + offsetX] = type;
        }
      }
    }
  }

  return (
    <div className={cn("game-panel", disabled && "opacity-40")}>
      <h3 className="text-[10px] text-primary neon-text mb-2">{label}</h3>
      <div className="grid grid-cols-4 gap-0 w-fit mx-auto">
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div key={`${y}-${x}`} className="w-4 h-4">
              {cell ? <TetrisCell value={cell} size="sm" /> : <div className="w-4 h-4" />}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
