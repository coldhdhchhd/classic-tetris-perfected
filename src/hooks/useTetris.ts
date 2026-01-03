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

// Level themes (hue values for HSL)
export const LEVEL_THEMES = [
  { hue: 180, name: 'Cyan Ocean' },      // 1-5
  { hue: 280, name: 'Purple Nebula' },   // 6-10
  { hue: 120, name: 'Green Matrix' },    // 11-15
  { hue: 30, name: 'Orange Sunset' },    // 16-20
  { hue: 340, name: 'Pink Neon' },       // 21-25
  { hue: 200, name: 'Blue Electric' },   // 26-30
  { hue: 60, name: 'Gold Rush' },        // 31-35
  { hue: 0, name: 'Red Fury' },          // 36+
];

export const getThemeForLevel = (level: number) => {
  const themeIndex = Math.min(Math.floor((level - 1) / 5), LEVEL_THEMES.length - 1);
  return LEVEL_THEMES[themeIndex];
};

const createEmptyBoard = (): Board => {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
};

// 7-bag randomizer for fair piece distribution
const createBag = (): TetrominoType[] => {
  const bag = [...TETROMINO_TYPES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
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
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [clearingLines, setClearingLines] = useState<number[]>([]);
  const [lastClearWasTetris, setLastClearWasTetris] = useState(false);
  const [showCombo, setShowCombo] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [scorePop, setScorePop] = useState(false);
  
  const bagRef = useRef<TetrominoType[]>([]);
  const gameLoopRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef<number>(0);

  const getNextFromBag = useCallback((): TetrominoType => {
    if (bagRef.current.length === 0) {
      bagRef.current = createBag();
    }
    return bagRef.current.pop()!;
  }, []);

  const createPiece = useCallback((type: TetrominoType): Tetromino => {
    return {
      type,
      shape: TETROMINOES[type].map(row => [...row]),
      position: { x: Math.floor((BOARD_WIDTH - TETROMINOES[type][0].length) / 2), y: 0 },
    };
  }, []);

  const getDropSpeed = useCallback(() => {
    // More aggressive speed curve
    const baseSpeed = 800;
    const minSpeed = 50;
    const speedDecrease = Math.pow(0.85, level - 1);
    return Math.max(minSpeed, baseSpeed * speedDecrease);
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

  // Calculate ghost piece position
  const getGhostPosition = useCallback((piece: Tetromino, boardState: Board): number => {
    let ghostY = piece.position.y;
    while (isValidMove({ ...piece, position: { ...piece.position, y: ghostY + 1 } }, boardState)) {
      ghostY++;
    }
    return ghostY;
  }, [isValidMove]);

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

  const clearFullLines = useCallback((boardState: Board): { newBoard: Board; linesCleared: number; clearedIndices: number[] } => {
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

  const triggerEffects = useCallback((linesCleared: number) => {
    if (linesCleared > 0) {
      setScreenShake(true);
      setScorePop(true);
      setTimeout(() => setScreenShake(false), 300);
      setTimeout(() => setScorePop(false), 300);
      
      if (linesCleared >= 2) {
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 1000);
      }
    }
  }, []);

  const spawnNewPiece = useCallback(() => {
    const newPiece = nextPiece || createPiece(getNextFromBag());
    const upcomingPiece = createPiece(getNextFromBag());
    
    if (!isValidMove(newPiece, board)) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }
    
    setCurrentPiece(newPiece);
    setNextPiece(upcomingPiece);
    setCanHold(true);
  }, [board, nextPiece, isValidMove, createPiece, getNextFromBag]);

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
      const { newBoard: clearedBoard, linesCleared, clearedIndices } = clearFullLines(newBoard);
      
      if (clearedIndices.length > 0) {
        setClearingLines(clearedIndices);
        triggerEffects(linesCleared);
        
        setTimeout(() => {
          setClearingLines([]);
          setBoard(clearedBoard);
          
          // Scoring: base + combo bonus + back-to-back tetris bonus
          const basePoints = [0, 100, 300, 500, 800][linesCleared];
          const comboBonus = combo * 50 * linesCleared;
          const backToBackBonus = lastClearWasTetris && linesCleared === 4 ? 400 : 0;
          const points = (basePoints + comboBonus + backToBackBonus) * level;
          
          setScore(prev => prev + points);
          setCombo(prev => prev + 1);
          setLastClearWasTetris(linesCleared === 4);
          
          setLines(prev => {
            const newLines = prev + linesCleared;
            const newLevel = Math.floor(newLines / 10) + 1;
            if (newLevel > level) {
              setLevel(newLevel);
              setShowLevelUp(true);
              setTimeout(() => setShowLevelUp(false), 1000);
            }
            return newLines;
          });
          
          setCurrentPiece(null);
        }, 400);
      } else {
        setBoard(clearedBoard);
        setCombo(0);
        setCurrentPiece(null);
      }
    }
  }, [currentPiece, board, isPaused, gameOver, isValidMove, lockPiece, clearFullLines, level, combo, lastClearWasTetris, triggerEffects]);

  const moveLeft = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return;
    const now = Date.now();
    if (now - lastMoveTimeRef.current < 50) return;
    lastMoveTimeRef.current = now;

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
    const now = Date.now();
    if (now - lastMoveTimeRef.current < 50) return;
    lastMoveTimeRef.current = now;

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

    let dropDistance = 0;
    let newPiece = { ...currentPiece };

    while (isValidMove({ ...newPiece, position: { ...newPiece.position, y: newPiece.position.y + 1 } }, board)) {
      newPiece = { ...newPiece, position: { ...newPiece.position, y: newPiece.position.y + 1 } };
      dropDistance++;
    }

    setScore(prev => prev + dropDistance * 2);
    setCurrentPiece(newPiece);
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 150);
    
    setTimeout(() => moveDown(), 0);
  }, [currentPiece, board, isPaused, gameOver, isValidMove, moveDown]);

  const hold = useCallback(() => {
    if (!currentPiece || !canHold || isPaused || gameOver) return;

    const currentType = currentPiece.type;
    
    if (holdPiece) {
      setCurrentPiece(createPiece(holdPiece));
    } else {
      setCurrentPiece(null);
    }
    
    setHoldPiece(currentType);
    setCanHold(false);
  }, [currentPiece, holdPiece, canHold, isPaused, gameOver, createPiece]);

  const startGame = useCallback(() => {
    bagRef.current = createBag();
    setBoard(createEmptyBoard());
    setScore(0);
    setLines(0);
    setLevel(1);
    setCombo(0);
    setGameOver(false);
    setIsPlaying(true);
    setIsPaused(false);
    setClearingLines([]);
    setHoldPiece(null);
    setCanHold(true);
    setLastClearWasTetris(false);
    
    const first = createPiece(getNextFromBag());
    const second = createPiece(getNextFromBag());
    setCurrentPiece(first);
    setNextPiece(second);
  }, [createPiece, getNextFromBag]);

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
        case 'x':
        case 'X':
          e.preventDefault();
          rotate();
          break;
        case ' ':
          e.preventDefault();
          hardDrop();
          break;
        case 'c':
        case 'C':
        case 'Shift':
          e.preventDefault();
          hold();
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
  }, [isPlaying, moveLeft, moveRight, moveDown, rotate, hardDrop, hold, togglePause, startGame]);

  // Merge current piece and ghost onto display board
  const displayBoard = board.map(row => [...row]);
  const ghostY = currentPiece ? getGhostPosition(currentPiece, board) : 0;
  
  // Add ghost piece first (so current piece renders on top)
  if (currentPiece && ghostY !== currentPiece.position.y) {
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardY = ghostY + y;
          const boardX = currentPiece.position.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            if (!displayBoard[boardY][boardX]) {
              displayBoard[boardY][boardX] = `ghost-${currentPiece.type}` as CellValue;
            }
          }
        }
      }
    }
  }

  // Add current piece
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
  };
};
