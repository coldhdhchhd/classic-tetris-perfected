import { useState, useCallback, useEffect, useRef } from 'react';

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  position: Position;
}

export type CellValue = TetrominoType | null;
export type Board = CellValue[][];

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const TETROMINOES: Record<TetrominoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

const createEmptyBoard = (): Board => {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
};

const getRandomTetromino = (): Tetromino => {
  const type = TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
  return {
    type,
    shape: TETROMINOES[type].map(row => [...row]),
    position: { x: Math.floor((BOARD_WIDTH - TETROMINOES[type][0].length) / 2), y: 0 },
  };
};

const rotateMatrix = (matrix: number[][]): number[][] => {
  const N = matrix.length;
  const result = matrix.map((row, i) =>
    row.map((_, j) => matrix[N - 1 - j][i])
  );
  return result;
};

export const useTetris = () => {
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [nextPiece, setNextPiece] = useState<Tetromino | null>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [clearingLines, setClearingLines] = useState<number[]>([]);
  
  const gameLoopRef = useRef<number | null>(null);

  const getDropSpeed = useCallback(() => {
    return Math.max(100, 1000 - (level - 1) * 100);
  }, [level]);

  const isValidMove = useCallback((piece: Tetromino, boardState: Board): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.position.x + x;
          const newY = piece.position.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && boardState[newY][newX] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const lockPiece = useCallback((piece: Tetromino, boardState: Board): Board => {
    const newBoard = boardState.map(row => [...row]);
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.position.y + y;
          const boardX = piece.position.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = piece.type;
          }
        }
      }
    }
    
    return newBoard;
  }, []);

  const clearLines = useCallback((boardState: Board): { newBoard: Board; linesCleared: number; clearedIndices: number[] } => {
    const clearedIndices: number[] = [];
    
    boardState.forEach((row, index) => {
      if (row.every(cell => cell !== null)) {
        clearedIndices.push(index);
      }
    });

    if (clearedIndices.length === 0) {
      return { newBoard: boardState, linesCleared: 0, clearedIndices: [] };
    }

    const newBoard = boardState.filter((_, index) => !clearedIndices.includes(index));
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }

    return { newBoard, linesCleared: clearedIndices.length, clearedIndices };
  }, []);

  const spawnNewPiece = useCallback(() => {
    const newPiece = nextPiece || getRandomTetromino();
    const upcomingPiece = getRandomTetromino();
    
    if (!isValidMove(newPiece, board)) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }
    
    setCurrentPiece(newPiece);
    setNextPiece(upcomingPiece);
  }, [board, nextPiece, isValidMove]);

  const moveDown = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return;

    const newPiece = {
      ...currentPiece,
      position: { ...currentPiece.position, y: currentPiece.position.y + 1 },
    };

    if (isValidMove(newPiece, board)) {
      setCurrentPiece(newPiece);
    } else {
      const newBoard = lockPiece(currentPiece, board);
      const { newBoard: clearedBoard, linesCleared, clearedIndices } = clearLines(newBoard);
      
      if (clearedIndices.length > 0) {
        setClearingLines(clearedIndices);
        setTimeout(() => {
          setClearingLines([]);
          setBoard(clearedBoard);
          
          const points = [0, 100, 300, 500, 800][linesCleared] * level;
          setScore(prev => prev + points);
          setLines(prev => {
            const newLines = prev + linesCleared;
            if (Math.floor(newLines / 10) > Math.floor(prev / 10)) {
              setLevel(l => l + 1);
            }
            return newLines;
          });
          
          setCurrentPiece(null);
        }, 300);
      } else {
        setBoard(clearedBoard);
        setCurrentPiece(null);
      }
    }
  }, [currentPiece, board, isPaused, gameOver, isValidMove, lockPiece, clearLines, level]);

  const moveLeft = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return;

    const newPiece = {
      ...currentPiece,
      position: { ...currentPiece.position, x: currentPiece.position.x - 1 },
    };

    if (isValidMove(newPiece, board)) {
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, board, isPaused, gameOver, isValidMove]);

  const moveRight = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return;

    const newPiece = {
      ...currentPiece,
      position: { ...currentPiece.position, x: currentPiece.position.x + 1 },
    };

    if (isValidMove(newPiece, board)) {
      setCurrentPiece(newPiece);
    }
  }, [currentPiece, board, isPaused, gameOver, isValidMove]);

  const rotate = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return;

    const rotatedShape = rotateMatrix(currentPiece.shape);
    const newPiece = {
      ...currentPiece,
      shape: rotatedShape,
    };

    // Wall kick attempts
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      const kickedPiece = {
        ...newPiece,
        position: { ...newPiece.position, x: newPiece.position.x + kick },
      };
      if (isValidMove(kickedPiece, board)) {
        setCurrentPiece(kickedPiece);
        return;
      }
    }
  }, [currentPiece, board, isPaused, gameOver, isValidMove]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return;

    let newPiece = { ...currentPiece };
    let dropDistance = 0;

    while (isValidMove({ ...newPiece, position: { ...newPiece.position, y: newPiece.position.y + 1 } }, board)) {
      newPiece = { ...newPiece, position: { ...newPiece.position, y: newPiece.position.y + 1 } };
      dropDistance++;
    }

    setScore(prev => prev + dropDistance * 2);
    setCurrentPiece(newPiece);
    
    // Immediately lock
    setTimeout(() => moveDown(), 0);
  }, [currentPiece, board, isPaused, gameOver, isValidMove, moveDown]);

  const startGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setIsPlaying(true);
    setIsPaused(false);
    setClearingLines([]);
    
    const first = getRandomTetromino();
    const second = getRandomTetromino();
    setCurrentPiece(first);
    setNextPiece(second);
  }, []);

  const togglePause = useCallback(() => {
    if (!isPlaying || gameOver) return;
    setIsPaused(prev => !prev);
  }, [isPlaying, gameOver]);

  // Spawn new piece when current is null
  useEffect(() => {
    if (isPlaying && !currentPiece && !gameOver && clearingLines.length === 0) {
      spawnNewPiece();
    }
  }, [currentPiece, isPlaying, gameOver, clearingLines, spawnNewPiece]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || isPaused || gameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    gameLoopRef.current = window.setInterval(moveDown, getDropSpeed());

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying, isPaused, gameOver, moveDown, getDropSpeed]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) {
        if (e.key === 'Enter' || e.key === ' ') {
          startGame();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          moveDown();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
        case 'Escape':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, moveLeft, moveRight, moveDown, rotate, hardDrop, togglePause, startGame]);

  // Merge current piece onto display board
  const displayBoard = board.map(row => [...row]);
  if (currentPiece) {
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardY = currentPiece.position.y + y;
          const boardX = currentPiece.position.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            displayBoard[boardY][boardX] = currentPiece.type;
          }
        }
      }
    }
  }

  return {
    board: displayBoard,
    currentPiece,
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
  };
};
