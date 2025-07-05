const intro = document.getElementById("intro-screen");
const startBtn = document.getElementById("start-btn");
const gameScreen = document.getElementById("game-screen");
const menuBtn = document.getElementById("menu-button");
const menuToggle = document.getElementById("menu-toggle");
const dropdown = document.getElementById("menu-dropdown");
const scoreDisplay = document.getElementById("score");
const finalScore = document.getElementById("final-score");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameOverMessage = document.getElementById("game-over-message");

const box = 20;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let snake = [{ x: 160, y: 200 }];
let direction = "RIGHT";
let score = 0;
let food = {};
let speed = 200;
let game;
let isPaused = false;

// 🎮 Start Game
startBtn.addEventListener("click", () => {
  intro.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  menuBtn.classList.remove("hidden");
  startGame();
});

// 📋 Menu toggle
menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.classList.toggle("hidden");
});

// 📌 Global click: hide menu
document.addEventListener("click", (e) => {
  if (!menuToggle.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

function startGame() {
  clearInterval(game);
  resetGame();
  game = setInterval(draw, speed);
}

function resetGame() {
  snake = [{ x: 160, y: 200 }];
  direction = "RIGHT";
  score = 0;
  speed = 200;
  food = generateSafeFood();
  scoreDisplay.textContent = "Score: 0";
  gameOverMessage.classList.add("hidden");
}

function generateSafeFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * (canvasWidth / box)) * box,
      y: Math.floor(Math.random() * (canvasHeight / box)) * box,
    };
  } while (collision(newFood.x, newFood.y, snake));
  return newFood;
}

function draw() {
  drawBackground();

  // Snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#1b4b4f" : "#225E63";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // Food
  ctx.beginPath();
  ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, Math.PI * 2);
  ctx.fillStyle = "#FFEDF3";
  ctx.fill();
  ctx.closePath();

  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "LEFT") headX -= box;
  if (direction === "RIGHT") headX += box;
  if (direction === "UP") headY -= box;
  if (direction === "DOWN") headY += box;

  // Game Over check
  if (
    headX < 0 || headY < 0 ||
    headX >= canvasWidth || headY >= canvasHeight ||
    collision(headX, headY, snake)
  ) {
    clearInterval(game);
    finalScore.textContent = score;
    gameOverMessage.classList.remove("hidden");
    const username = localStorage.getItem("username");
if (!username) {
  console.error("⚠️ No username found.");
  return;
}

console.log("Username:", username);
saveScoreToLeaderboard("Snake Retro", username, score);

  }

  if (headX === food.x && headY === food.y) {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    food = generateSafeFood();
    if (speed > 60) {
      speed -= 10;
      clearInterval(game);
      game = setInterval(draw, speed);
    }
  } else {
    snake.pop();
  }

  const newHead = { x: headX, y: headY };
  snake.unshift(newHead);
}


function drawBackground() {
  ctx.fillStyle = "#0ABAB5";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.strokeStyle = "#333";
  ctx.lineWidth = 0.5;

  for (let x = 0; x < canvasWidth; x += box) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }

  for (let y = 0; y < canvasHeight; y += box) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }
}


// Keyboard Controls
document.addEventListener("keydown", (e) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }
  if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

// Restart
function restartGame() {
  dropdown.classList.add("hidden");
  clearInterval(game);
  startGame();
}

// Quit
function backToMenu() {
  clearInterval(game);
  intro.classList.remove("hidden");
  gameScreen.classList.add("hidden");
  menuBtn.classList.add("hidden");
  gameOverMessage.classList.add("hidden");
}

// Instructions
function showInstructions() {
  alert("🟩 Use arrow keys to move the snake.\nEat the food and avoid hitting walls or yourself.\nEach bite speeds you up!");
  dropdown.classList.add("hidden");
}

function collision(x, y, array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].x === x && array[i].y === y) {
      return true;
    }
  }
  return false;
}
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