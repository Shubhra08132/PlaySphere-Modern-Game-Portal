document.getElementById("start-btn").addEventListener("click", () => {
  document.getElementById("intro-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");
  startGame();
});

let menuVisible = false;

document.getElementById("menu-btn").addEventListener("click", () => {
  menuVisible = !menuVisible;
  document.getElementById("menu-panel").style.display = menuVisible ? "block" : "none";
});

function toggleMenu() {
  alert("Instructions: Use arrow keys to reach the green exit!");
  document.getElementById("menu-panel").style.display = "none";
  menuVisible = false;
}

function restartGame() {
  playerPos = { row: 0, col: 0 };
  generateMaze();
  renderMaze();
  clearInterval(timerInterval);
  startTimer();
  statusText.classList.add('hidden');
  document.getElementById("menu-panel").style.display = "none";
  menuVisible = false;
}

// ========== Core Game Logic ========== //
const mazeContainer = document.getElementById('maze');
const startBtn = document.getElementById('start-btn');
const introScreen = document.getElementById('intro-screen');
const statusText = document.getElementById('status');
const timerDisplay = document.getElementById('timer');

const rows = 10;  // maze rows
const cols = 10;  // maze columns
let grid = [];
let playerPos = { row: 0, col: 0 };
let goalPos = { row: rows - 1, col: cols - 1 };
let startTime;
let timerInterval;

// Directions: top, right, bottom, left
const directions = [
  { row: -1, col: 0 },
  { row: 0, col: 1 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
];

// === Maze Cell ===
class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.visited = false;
    this.walls = [true, true, true, true]; // top, right, bottom, left
    this.element = null;
  }

  createElement() {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.style.borderTop = this.walls[0] ? '2px solid black' : '2px solid transparent';
    cell.style.borderRight = this.walls[1] ? '2px solid black' : '2px solid transparent';
    cell.style.borderBottom = this.walls[2] ? '2px solid black' : '2px solid transparent';
    cell.style.borderLeft = this.walls[3] ? '2px solid black' : '2px solid transparent';
    cell.style.backgroundColor = '#fff';
    this.element = cell;
    return cell;
  }
}

function index(row, col) {
  if (row < 0 || col < 0 || row >= rows || col >= cols) return -1;
  return row * cols + col;
}

function generateMaze() {
  grid = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      grid.push(new Cell(row, col));
    }
  }

  let stack = [];
  let current = grid[0];
  current.visited = true;

  while (true) {
    const neighbors = [];

    directions.forEach((dir, i) => {
      const newRow = current.row + dir.row;
      const newCol = current.col + dir.col;
      const neighborIndex = index(newRow, newCol);
      if (neighborIndex >= 0) {
        const neighbor = grid[neighborIndex];
        if (!neighbor.visited) {
          neighbors.push({ cell: neighbor, direction: i });
        }
      }
    });

    if (neighbors.length > 0) {
      const rnd = Math.floor(Math.random() * neighbors.length);
      const { cell: next, direction } = neighbors[rnd];

      // Remove walls
      current.walls[direction] = false;
      const opposite = (direction + 2) % 4;
      next.walls[opposite] = false;

      stack.push(current);
      current = next;
      current.visited = true;
    } else if (stack.length > 0) {
      current = stack.pop();
    } else {
      break;
    }
  }
}

function renderMaze() {
  mazeContainer.innerHTML = '';
  mazeContainer.style.display = 'grid';
  mazeContainer.style.gridTemplateRows = `repeat(${rows}, 40px)`;
  mazeContainer.style.gridTemplateColumns = `repeat(${cols}, 40px)`;

  grid.forEach(cell => {
    mazeContainer.appendChild(cell.createElement());
  });

  updatePlayer();
}

function updatePlayer() {
  grid.forEach(cell => {
    cell.element.style.backgroundColor = '#fff';
  });

  const playerCell = grid[index(playerPos.row, playerPos.col)];
  playerCell.element.style.backgroundColor = '#0ABAB5'; // player

  const goalCell = grid[index(goalPos.row, goalPos.col)];
  goalCell.element.style.backgroundColor = '#225E63'; // goal
}

function handleKey(e) {
  const key = e.key;
  let moveDir = -1;

  if (key === 'ArrowUp') moveDir = 0;
  if (key === 'ArrowRight') moveDir = 1;
  if (key === 'ArrowDown') moveDir = 2;
  if (key === 'ArrowLeft') moveDir = 3;

  if (moveDir === -1) return;

  const current = grid[index(playerPos.row, playerPos.col)];
  if (!current.walls[moveDir]) {
    playerPos.row += directions[moveDir].row;
    playerPos.col += directions[moveDir].col;
    updatePlayer();
    checkWin();
  }
}

function checkWin() {
  if (playerPos.row === goalPos.row && playerPos.col === goalPos.col) {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    endGame(`🎉 You escaped in ${elapsedTime} seconds!`);

  }
}

function endGame(message) {
  clearInterval(timerInterval);
  statusText.textContent = message;
  statusText.classList.remove('hidden');
  document.removeEventListener('keydown', handleKey); // Disable movement
  const username = localStorage.getItem("username");
  if (!username) {
    console.error("⚠️ No username found. Please log in to save score.");
    return;
  }

  console.log("Username:", username);
  saveScoreToLeaderboard("Flip And Match", username, secondsElapsed);
}


function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.textContent = `⏱️ Time: ${elapsed}s`;
  }, 1000);
}



// === Start Game ===
function startGame() {
  playerPos = { row: 0, col: 0 };
  generateMaze();
  renderMaze();
  startTimer();
  document.addEventListener('keydown', handleKey);
  document.getElementById("menu-panel").style.display = "none";
  menuVisible = false;
  // document.getElementById("status").classList.add("hidden");
  
  document.getElementById("start-btn").style.display = "none";
    document.querySelector("#game-screen h2").classList.remove("hidden");
  document.getElementById("status").classList.remove("hidden");

}
//save score in MONGODB
function saveScoreToLeaderboard(game, username, score) {
  fetch("http://localhost:5000/api/submit-score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, game, score })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Score submitted:", data);
  })
  .catch(err => {
    console.error("Error submitting score:", err);
  });
}



