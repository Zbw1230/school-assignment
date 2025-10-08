'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type Position = {
  x: number;
  y: number;
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export default function SnakeGame() {
  // 游戏设置
  const gridSize = 20;
  const cellSize = 20;
  
  // 根据屏幕大小调整游戏速度和网格大小
  const [gameSpeed, setGameSpeed] = useState(150); // 毫秒
  const [currentCellSize, setCurrentCellSize] = useState(cellSize);
  
  // 游戏状态
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const directionRef = useRef(direction);
  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);

  // 生成随机食物位置
  const generateFood = useCallback((): Position => {
    const newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };

    // 确保食物不在蛇身上
    const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    if (isOnSnake) {
      return generateFood();
    }

    return newFood;
  }, [snake]);

  // 初始化游戏
  const initGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    gameOverRef.current = false;
    setScore(0);
    setIsPaused(false);
    isPausedRef.current = false;
    setFood(generateFood());
    setGameStarted(true);
  }, [generateFood]);

  // 优化响应式布局
  useEffect(() => {
    const updateLayout = () => {
      // 根据屏幕宽度调整游戏元素
      if (window.innerWidth < 768) {
        // 移动端：减小网格大小，提高游戏速度
        setCurrentCellSize(15);
        setGameSpeed(130);
      } else {
        // 桌面端：使用标准网格大小
        setCurrentCellSize(cellSize);
        setGameSpeed(150);
      }
    };

    // 初始设置
    updateLayout();
    
    // 监听窗口大小变化
    window.addEventListener('resize', updateLayout);
    
    return () => {
      window.removeEventListener('resize', updateLayout);
    };
  }, []);

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) {
        if (e.key === ' ' || e.key === 'Enter') {
          initGame();
        }
        return;
      }

      // 暂停/继续游戏
      if (e.key === ' ' || e.key.toLowerCase() === 'p') {
        setIsPaused(prev => {
          const newPaused = !prev;
          isPausedRef.current = newPaused;
          return newPaused;
        });
        return;
      }

      if (isPausedRef.current) return;

      // WASD控制
      switch (e.key.toLowerCase()) {
        case 'w':
          if (directionRef.current !== 'DOWN') {
            setDirection('UP');
            directionRef.current = 'UP';
          }
          break;
        case 's':
          if (directionRef.current !== 'UP') {
            setDirection('DOWN');
            directionRef.current = 'DOWN';
          }
          break;
        case 'a':
          if (directionRef.current !== 'RIGHT') {
            setDirection('LEFT');
            directionRef.current = 'LEFT';
          }
          break;
        case 'd':
          if (directionRef.current !== 'LEFT') {
            setDirection('RIGHT');
            directionRef.current = 'RIGHT';
          }
          break;
      }
      
      // 方向键控制
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== 'DOWN') {
            setDirection('UP');
            directionRef.current = 'UP';
          }
          break;
        case 'ArrowDown':
          if (directionRef.current !== 'UP') {
            setDirection('DOWN');
            directionRef.current = 'DOWN';
          }
          break;
        case 'ArrowLeft':
          if (directionRef.current !== 'RIGHT') {
            setDirection('LEFT');
            directionRef.current = 'LEFT';
          }
          break;
        case 'ArrowRight':
          if (directionRef.current !== 'LEFT') {
            setDirection('RIGHT');
            directionRef.current = 'RIGHT';
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted, initGame]);

  // 游戏主循环
  useEffect(() => {
    if (!gameStarted || isPaused || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        
        // 根据方向移动蛇头
        switch (directionRef.current) {
          case 'UP':
            head.y -= 1;
            break;
          case 'DOWN':
            head.y += 1;
            break;
          case 'LEFT':
            head.x -= 1;
            break;
          case 'RIGHT':
            head.x += 1;
            break;
        }

        // 检查是否撞墙
        if (
          head.x < 0 || 
          head.x >= gridSize || 
          head.y < 0 || 
          head.y >= gridSize
        ) {
          setGameOver(true);
          gameOverRef.current = true;
          return prevSnake;
        }

        // 检查是否撞到自己
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          gameOverRef.current = true;
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];
        
        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
          setFood(generateFood());
          setScore(prev => prev + 10);
        } else {
          // 没吃到食物则移除尾部
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const gameInterval = setInterval(moveSnake, gameSpeed);
    return () => clearInterval(gameInterval);
  }, [gameStarted, isPaused, gameOver, food, generateFood, gameSpeed]);

  // 更新引用值
  useEffect(() => {
    directionRef.current = direction;
    gameOverRef.current = gameOver;
    isPausedRef.current = isPaused;
  }, [direction, gameOver, isPaused]);

  // 渲染游戏网格
  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const isSnake = snake.some(segment => segment.x === x && segment.y === y);
        const isHead = snake[0].x === x && snake[0].y === y;
        const isFood = food.x === x && food.y === y;

        let cellClass = `w-${currentCellSize / 5} h-${currentCellSize / 5} border border-gray-800`;

        if (isHead) {
          cellClass += ' bg-green-600';
        } else if (isSnake) {
          cellClass += ' bg-green-500';
        } else if (isFood) {
          cellClass += ' bg-red-500 rounded-full';
        } else {
          cellClass += ' bg-gray-800';
        }

        grid.push(
          <div
            key={`${x}-${y}`}
            className={cellClass}
            style={{ 
              width: `${currentCellSize}px`, 
              height: `${currentCellSize}px`,
              minWidth: `${currentCellSize}px`,
              minHeight: `${currentCellSize}px`
            }}
          />
        );
      }
    }
    return grid;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
          贪吃蛇游戏
        </h1>
        
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-gray-800 px-3 sm:px-4 py-2 rounded-lg">
              <span className="text-gray-400 mr-2">得分:</span>
              <span className="font-bold text-lg sm:text-xl text-green-400">{score}</span>
            </div>
            
            {!gameStarted ? (
              <button
                onClick={initGame}
                className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold py-2 px-4 sm:px-6 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                开始游戏
              </button>
            ) : (
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-2 px-4 sm:px-6 rounded-full transition-all duration-300"
              >
                {isPaused ? '继续' : '暂停'}
              </button>
            )}
          </div>
          
          <div className="text-gray-400 text-xs sm:text-sm">
            <p>使用 <span className="font-bold text-cyan-400">方向键</span> 或 <span className="font-bold text-cyan-400">WASD</span> 控制</p>
            <p>空格键或P键暂停</p>
          </div>
        </div>

        {/* 游戏区域 */}
        <div className="flex flex-col items-center">
          <div 
            className="grid border-2 sm:border-4 border-gray-700 rounded-lg overflow-hidden bg-gray-900 shadow-2xl"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              width: `${gridSize * currentCellSize}px`,
              height: `${gridSize * currentCellSize}px`,
              maxWidth: '100%',
              maxHeight: '70vh'
            }}
          >
            {renderGrid()}
          </div>

          {/* 移动端控制按钮 */}
          <div className="mt-6 sm:mt-8 md:hidden">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 w-48 mx-auto">
              <div></div>
              <button
                onClick={() => {
                  if (!isPaused && !gameOver && directionRef.current !== 'DOWN') {
                    setDirection('UP');
                    directionRef.current = 'UP';
                  }
                }}
                className="bg-gray-800 text-white p-3 sm:p-4 rounded-lg flex items-center justify-center active:bg-gray-700"
                aria-label="上"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <div></div>
              
              <button
                onClick={() => {
                  if (!isPaused && !gameOver && directionRef.current !== 'RIGHT') {
                    setDirection('LEFT');
                    directionRef.current = 'LEFT';
                  }
                }}
                className="bg-gray-800 text-white p-3 sm:p-4 rounded-lg flex items-center justify-center active:bg-gray-700"
                aria-label="左"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => {
                  if (!isPaused && !gameOver && directionRef.current !== 'LEFT') {
                    setDirection('RIGHT');
                    directionRef.current = 'RIGHT';
                  }
                }}
                className="bg-gray-800 text-white p-3 sm:p-4 rounded-lg flex items-center justify-center active:bg-gray-700"
                aria-label="右"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <div></div>
              <button
                onClick={() => {
                  if (!isPaused && !gameOver && directionRef.current !== 'UP') {
                    setDirection('DOWN');
                    directionRef.current = 'DOWN';
                  }
                }}
                className="bg-gray-800 text-white p-3 sm:p-4 rounded-lg flex items-center justify-center active:bg-gray-700"
                aria-label="下"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div></div>
            </div>
          </div>
        </div>

        {/* 游戏结束提示 */}
        {gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 sm:p-8 rounded-xl text-center max-w-xs sm:max-w-md w-full mx-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-red-500 mb-4">游戏结束!</h2>
              <p className="text-lg sm:text-xl mb-2">最终得分: <span className="text-green-400 font-bold">{score}</span></p>
              <button
                onClick={initGame}
                className="mt-4 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-full text-base sm:text-lg transition-all duration-300 transform hover:scale-105"
              >
                重新开始
              </button>
            </div>
          </div>
        )}

        {/* 暂停提示 */}
        {isPaused && !gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
            <div className="bg-gray-800 p-6 sm:p-8 rounded-xl text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-4">游戏暂停</h2>
              <p className="text-base sm:text-xl mb-4">按&quot;继续&quot;按钮或空格键继续游戏</p>
            </div>
          </div>
        )}

        {/* 游戏说明 */}
        <div className="mt-6 sm:mt-8 bg-gray-800/50 p-3 sm:p-4 rounded-lg max-w-2xl mx-auto">
          <h3 className="text-base sm:text-lg font-semibold text-cyan-400 mb-2">游戏说明</h3>
          <ul className="text-gray-300 text-xs sm:text-sm space-y-1">
            <li>• 使用键盘方向键或WASD控制蛇的移动方向</li>
            <li>• 吃到红色食物增加得分和长度</li>
            <li>• 避免撞墙或撞到自己的身体</li>
            <li>• 空格键或P键暂停/继续游戏</li>
          </ul>
        </div>
      </div>
    </div>
  );
}