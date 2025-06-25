let level = 1;
let mazeSize = 10;
let mazeLayout = [];
let playerPos = {};
let goalPos = {};
let timer = 0;
let interval = null;
let gameRunning = false;

const maze = document.getElementById('maze');
const statusText = document.getElementById('status');
const timerDisplay = document.getElementById('timer');

// Generate Maze (basic: open path around wall border)
function generateMaze(size) {
  const maze = Array.from({ length: size }, () => Array(size).fill(1));
  const visited = Array.from({ length: size }, () => Array(size).fill(false));

  const dx = [0, 0, -2, 2];
  const dy = [-2, 2, 0, 0];

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function carve(x, y) {
    visited[y][x] = true;
    maze[y][x] = 0;

    const directions = shuffle([0, 1, 2, 3]);

    for (let i = 0; i < 4; i++) {
      const nx = x + dx[directions[i]];
      const ny = y + dy[directions[i]];

      if (ny > 0 && ny < size - 1 && nx > 0 && nx < size - 1 && !visited[ny][nx]) {
        // Carve path between (x,y) and (nx,ny)
        maze[(y + ny) / 2][(x + nx) / 2] = 0;
        carve(nx, ny);
      }
    }
  }

  carve(1, 1); // start from (1,1)
  maze[1][1] = 0; // Ensure start open
  maze[size - 2][size - 2] = 0; // Ensure goal open

  return maze;
}

// Draw Maze
function drawMaze() {
  maze.innerHTML = '';
  maze.style.gridTemplateColumns = `repeat(${mazeSize}, 40px)`;
  maze.style.gridTemplateRows = `repeat(${mazeSize}, 40px)`;

  for (let y = 0; y < mazeSize; y++) {
    for (let x = 0; x < mazeSize; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      if (mazeLayout[y][x] === 1) cell.classList.add('wall');
      else cell.classList.add('path');

      if (x === playerPos.x && y === playerPos.y) cell.classList.add('player');
      if (x === goalPos.x && y === goalPos.y) cell.classList.add('goal');

      maze.appendChild(cell);
    }
  }
}

// Timer
function startTimer() {
  interval = setInterval(() => {
    timer++;
    timerDisplay.textContent = `⏱️ Time: ${timer}s`;
  }, 1000);
}
function stopTimer() {
  clearInterval(interval);
}

// Movement
function movePlayer(dx, dy) {
  if (!gameRunning) return;
  const newX = playerPos.x + dx;
  const newY = playerPos.y + dy;

  if (
    newX >= 0 && newX < mazeSize &&
    newY >= 0 && newY < mazeSize &&
    mazeLayout[newY][newX] === 0
  ) {
    playerPos = { x: newX, y: newY };
    drawMaze();
    checkWin();
  }
}

// Win Check
function checkWin() {
  if (playerPos.x === goalPos.x && playerPos.y === goalPos.y) {
    stopTimer();
    gameRunning = false;
    statusText.textContent = `🎉 Level ${level} complete in ${timer}s! Press Start for next level`;
    level++;
  }
}

// Start Level
function startLevel() {
  mazeSize = 10 + (level - 1) * 2;
  mazeLayout = generateMaze(mazeSize);
  playerPos = { x: 1, y: 1 };
  goalPos = { x: mazeSize - 2, y: mazeSize - 2 };
  timer = 0;
  timerDisplay.textContent = "⏱️ Time: 0s";
  gameRunning = true;
  drawMaze();
  startTimer();
  statusText.textContent = `🧠 Level ${level} - Reach the goal!`;
}

// Reset to Level 1
function resetGame() {
  stopTimer();
  level = 1;
  startLevel();
}

// Event Listeners
document.addEventListener('keydown', (e) => {
  if (!gameRunning) return;
  switch (e.key) {
    case "ArrowUp": movePlayer(0, -1); break;
    case "ArrowDown": movePlayer(0, 1); break;
    case "ArrowLeft": movePlayer(-1, 0); break;
    case "ArrowRight": movePlayer(1, 0); break;
  }
});

document.getElementById('startBtn').addEventListener('click', () => {
  if (!gameRunning) startLevel();
});

document.getElementById('pauseBtn').addEventListener('click', () => {
  if (gameRunning) {
    gameRunning = false;
    stopTimer();
    statusText.textContent = "⏸️ Game paused.";
  }
});

document.getElementById('resetBtn').addEventListener('click', () => {
  resetGame();
});
