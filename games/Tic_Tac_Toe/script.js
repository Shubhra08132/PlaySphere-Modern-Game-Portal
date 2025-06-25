const mainMenu = document.getElementById('main-menu');
const gameDiv = document.getElementById('game');
const boardDiv = document.getElementById('board');
const statusText = document.getElementById('status');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const scoreDraw = document.getElementById('scoreDraw');
const winLine = document.getElementById('win-line');
const difficultySelect = document.getElementById('difficulty-select');

const singleBtn = document.getElementById("single");
const twoBtn = document.getElementById("multi");
const backBtn = document.getElementById("backBtn");

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;
let mode = 'multi';
let difficulty = 'easy';
let scores = { X: 0, O: 0, Draw: 0 };

singleBtn.addEventListener("click", () => {
  selectMode('single');
});

twoBtn.addEventListener("click", () => {
  selectMode('multi');
});

backBtn.addEventListener("click", () => {
  difficultySelect.style.display = "none";
  backBtn.style.display = "none";
  twoBtn.style.display = "inline-block";
});

function selectMode(selectedMode) {
  mode = selectedMode;
  if (mode === 'single') {
    difficultySelect.style.display = 'block';
    twoBtn.style.display = 'none';
    backBtn.style.display = 'inline-block';
  } else {
    difficultySelect.style.display = 'none';
    startGame();
  }
}

function startGame(selectedDifficulty = 'easy') {
  difficulty = selectedDifficulty;
  mainMenu.style.display = 'none';
  gameDiv.style.display = 'block';
  backBtn.style.display = 'none';
  difficultySelect.style.display = 'none';
  restartGame();
}

function goBack() {
  gameDiv.style.display = 'none';
  mainMenu.style.display = 'block';
  winLine.style.display = 'none';
  twoBtn.style.display = 'inline-block';
  backBtn.style.display = 'none';
  difficultySelect.style.display = 'none';
}

function restartGame() {
  board = Array(9).fill('');
  gameActive = true;
  currentPlayer = 'X';
  statusText.textContent = '';
  winLine.style.display = 'none';
  renderBoard();
}

function renderBoard() {
  const winLineElement = document.getElementById('win-line');
  boardDiv.innerHTML = '';
  boardDiv.appendChild(winLineElement); // reattach win-line
  
  board.forEach((cell, index) => {
    const cellDiv = document.createElement('div');
    cellDiv.classList.add('cell');
    if (cell) {
      cellDiv.textContent = cell;
      cellDiv.classList.add(cell.toLowerCase());
    }
    cellDiv.addEventListener('click', () => handleMove(index));
    boardDiv.appendChild(cellDiv);
  });
}

function handleMove(index) {
  if (!gameActive || board[index]) return;

  board[index] = currentPlayer;
  renderBoard();

  if (checkWin()) {
    statusText.innerHTML = `🎉 Player ${currentPlayer} wins!`;
    scores[currentPlayer]++;
    gameActive = false;
    updateScores();
    return;
  }

  if (board.every(cell => cell)) {
    statusText.innerHTML = "It's a Draw!";
    scores.Draw++;
    gameActive = false;
    updateScores();
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

  if (mode === 'single' && currentPlayer === 'O') {
    setTimeout(() => aiMove(), 300);
  }
}

function aiMove() {
  let available = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);

  let move;
  if (difficulty === 'easy') {
    move = available[Math.floor(Math.random() * available.length)];
  } else {
    move = findBestMove('O') || findBestMove('X') || available[Math.floor(Math.random() * available.length)];
  }

  if (move !== undefined) handleMove(move);
}

function findBestMove(player) {
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = player;
      if (checkWinInternal(player)) {
        board[i] = '';
        return i;
      }
      board[i] = '';
    }
  }
  return null;
}

function checkWinInternal(player) {
  const combos = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  return combos.some(c => c.every(i => board[i] === player));
}

function checkWin() {
  const combos = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  for (let combo of combos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      positionWinLine(combo);
      winLine.style.display = 'block';
      return true;
    }
  }
  return false;
}

function positionWinLine(combo) {
  const cells = document.querySelectorAll('.cell');

  const startCell = cells[combo[0]];
  const endCell = cells[combo[2]];

  const boardRect = boardDiv.getBoundingClientRect();
  const startRect = startCell.getBoundingClientRect();
  const endRect = endCell.getBoundingClientRect();

  const x1 = startRect.left + startRect.width / 2 - boardRect.left;
  const y1 = startRect.top + startRect.height / 2 - boardRect.top;
  const x2 = endRect.left + endRect.width / 2 - boardRect.left;
  const y2 = endRect.top + endRect.height / 2 - boardRect.top;

  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  winLine.style.width = `${length}px`;
  winLine.style.left = `${x1}px`;
  winLine.style.top = `${y1}px`;
  winLine.style.transform = `rotate(${angle}deg)`;
  winLine.style.transformOrigin = "0% 50%";
  winLine.style.display = "block";
}

function updateScores() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreDraw.textContent = scores.Draw;
}
