import { useState, useEffect, useCallback } from 'react';

interface FruitMatchGameProps {
  playerName?: string;
  points?: number;
}

const FRUITS = ['🍎', '🍊', '🍇', '🍉', '🍋', '🍒', '🍓', '🥝'];
const BOARD_SIZE = 8;

type Board = string[][];
type Position = { row: number; col: number };

export function FruitMatchGame({ playerName = "Player" }: FruitMatchGameProps) {
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [selectedTile, setSelectedTile] = useState<Position | null>(null);
  const [gameActive, setGameActive] = useState(true);
  const [moves, setMoves] = useState(0);

  const getRandomFruit = useCallback(() => {
    return FRUITS[Math.floor(Math.random() * FRUITS.length)];
  }, []);

  const findMatches = useCallback((gameBoard: Board): Position[] => {
    const matches: Position[] = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE - 2; col++) {
        const fruit = gameBoard[row][col];
        if (fruit && gameBoard[row][col + 1] === fruit && gameBoard[row][col + 2] === fruit) {
          matches.push({ row, col }, { row, col: col + 1 }, { row, col: col + 2 });
          let extraCol = col + 3;
          while (extraCol < BOARD_SIZE && gameBoard[row][extraCol] === fruit) {
            matches.push({ row, col: extraCol });
            extraCol++;
          }
        }
      }
    }
    
    for (let col = 0; col < BOARD_SIZE; col++) {
      for (let row = 0; row < BOARD_SIZE - 2; row++) {
        const fruit = gameBoard[row][col];
        if (fruit && gameBoard[row + 1][col] === fruit && gameBoard[row + 2][col] === fruit) {
          matches.push({ row, col }, { row: row + 1, col }, { row: row + 2, col });
          let extraRow = row + 3;
          while (extraRow < BOARD_SIZE && gameBoard[extraRow][col] === fruit) {
            matches.push({ row: extraRow, col });
            extraRow++;
          }
        }
      }
    }
    
    return matches.filter((match, index, self) => 
      index === self.findIndex(m => m.row === match.row && m.col === match.col)
    );
  }, []);

  const removeMatches = useCallback((gameBoard: Board) => {
    const matches = findMatches(gameBoard);
    matches.forEach(({ row, col }) => {
      gameBoard[row][col] = '';
    });
    return matches.length;
  }, [findMatches]);

  const fillBoard = useCallback((gameBoard: Board) => {
    for (let col = 0; col < BOARD_SIZE; col++) {
      for (let row = BOARD_SIZE - 1; row >= 0; row--) {
        if (gameBoard[row][col] === '') {
          for (let k = row - 1; k >= 0; k--) {
            if (gameBoard[k][col] !== '') {
              gameBoard[row][col] = gameBoard[k][col];
              gameBoard[k][col] = '';
              break;
            }
          }
          if (gameBoard[row][col] === '') {
            gameBoard[row][col] = getRandomFruit();
          }
        }
      }
    }
  }, [getRandomFruit]);

  const createBoard = useCallback(() => {
    const newBoard: Board = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      newBoard[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        newBoard[row][col] = getRandomFruit();
      }
    }
    
    let attempts = 0;
    while (findMatches(newBoard).length > 0 && attempts < 50) {
      removeMatches(newBoard);
      fillBoard(newBoard);
      attempts++;
    }
    
    return newBoard;
  }, [getRandomFruit, findMatches, removeMatches, fillBoard]);


  const isAdjacent = useCallback((pos1: Position, pos2: Position): boolean => {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }, []);

  const wouldCreateMatch = useCallback((gameBoard: Board, pos1: Position, pos2: Position): boolean => {
    const tempBoard = gameBoard.map(row => [...row]);
    [tempBoard[pos1.row][pos1.col], tempBoard[pos2.row][pos2.col]] = 
    [tempBoard[pos2.row][pos2.col], tempBoard[pos1.row][pos1.col]];
    return findMatches(tempBoard).length > 0;
  }, [findMatches]);

  const processMatches = useCallback((gameBoard: Board) => {
    const newBoard = gameBoard.map(row => [...row]);
    const matchCount = removeMatches(newBoard);
    
    if (matchCount > 0) {
      setScore(prev => prev + matchCount * 10);
      fillBoard(newBoard);
      setBoard(newBoard);
      
      setTimeout(() => {
        processMatches(newBoard);
      }, 500);
    }
  }, [removeMatches, fillBoard]);

  const swapTiles = useCallback((pos1: Position, pos2: Position) => {
    if (!isAdjacent(pos1, pos2)) return false;
    
    const newBoard = board.map(row => [...row]);
    if (!wouldCreateMatch(newBoard, pos1, pos2)) return false;
    
    [newBoard[pos1.row][pos1.col], newBoard[pos2.row][pos2.col]] = 
    [newBoard[pos2.row][pos2.col], newBoard[pos1.row][pos1.col]];
    
    setBoard(newBoard);
    setMoves(prev => prev + 1);
    
    setTimeout(() => {
      processMatches(newBoard);
    }, 300);
    
    return true;
  }, [board, isAdjacent, wouldCreateMatch, processMatches]);

  const handleTileClick = useCallback((row: number, col: number) => {
    if (!gameActive) return;
    
    const clickedPos = { row, col };
    
    if (!selectedTile) {
      setSelectedTile(clickedPos);
    } else if (selectedTile.row === row && selectedTile.col === col) {
      setSelectedTile(null);
    } else {
      const swapped = swapTiles(selectedTile, clickedPos);
      setSelectedTile(null);
      if (!swapped) {
        setSelectedTile(clickedPos);
      }
    }
  }, [gameActive, selectedTile, swapTiles]);

  const resetGame = useCallback(() => {
    const newBoard = createBoard();
    setBoard(newBoard);
    setScore(0);
    setMoves(0);
    setSelectedTile(null);
    setGameActive(true);
  }, [createBoard]);

  useEffect(() => {
    const newBoard = createBoard();
    setBoard(newBoard);
  }, [createBoard]);

  return (
    <div className="flex flex-col h-full w-full p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="text-white">
          <div className="text-lg font-bold">🍎 Fruit Match</div>
          <div className="text-sm opacity-75">Player: {playerName}</div>
        </div>
        <div className="text-white text-right">
          <div className="text-lg font-bold">Score: {score}</div>
          <div className="text-sm opacity-75">Moves: {moves}</div>
        </div>
        <button
          onClick={resetGame}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded transition-colors"
        >
          Reset
        </button>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div 
          className="grid gap-1 p-2 bg-black/20 rounded-lg"
          style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}
        >
          {board.map((row, rowIndex) =>
            row.map((fruit, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-8 h-8 flex items-center justify-center text-lg cursor-pointer
                  bg-white/10 hover:bg-white/20 rounded transition-all duration-200
                  ${selectedTile?.row === rowIndex && selectedTile?.col === colIndex 
                    ? 'ring-2 ring-yellow-400 bg-yellow-400/20' 
                    : ''
                  }
                `}
                onClick={() => handleTileClick(rowIndex, colIndex)}
              >
                {fruit}
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="text-center text-white/75 text-xs mt-2">
        Click adjacent fruits to swap and create matches of 3 or more!
      </div>
    </div>
  );
}
