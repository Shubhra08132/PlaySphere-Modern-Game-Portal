const intro = document.getElementById("intro-screen");
const startBtn = document.getElementById("start-btn");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const finalScore = document.getElementById("final-score");
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const gameOverMessage = document.getElementById("game-over-message");

const username = localStorage.getItem("username");

if (!username) {
   console.warn("No username found. Please log in to save score.");
   // Optional: Redirect to login page
}

const menuBtn = document.getElementById("menu-button");
const dropdown = document.getElementById("menu-dropdown");
const menuToggleBtn = document.getElementById("menu-toggle");
menuToggleBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevent it from closing immediately
  dropdown.classList.toggle("hidden");
});

// Game Variables
let blocks = [];
let currentBlock;
let speed = 2;
let direction = 1;
let score = 0;
let animationId;
let gameRunning = false;

// Show dropdown
function toggleDropdown() {
  dropdown.classList.toggle("hidden");
}

// Start Game
startBtn.addEventListener("click", () => {
  intro.classList.add("hidden");
  menuBtn.classList.remove("hidden");
  startGame();
});

function startGame() {
  gameOverMessage.classList.add("hidden");
  gameContainer.classList.remove("hidden");
  menuBtn.classList.remove("hidden");
  dropdown.classList.add("hidden");

  initGame();
}

function initGame() {
  blocks = [];
  score = 0;
  speed = 2;
  direction = 1;
  gameRunning = true;
  scoreDisplay.textContent = "Score: 0";

  blocks.push({ x: 100, y: canvas.height - 30, width: 200, height: 30 });
  spawnBlock();
  requestAnimationFrame(gameLoop);
}

function spawnBlock() {
  const prev = blocks[blocks.length - 1];
  currentBlock = {
    x: 0,
    y: prev.y - 30,
    width: prev.width,
    height: 30,
  };
}

function gameLoop() {
  if (!gameRunning) return;
  update();
  draw();
  animationId = requestAnimationFrame(gameLoop);
}

function update() {
  currentBlock.x += speed * direction;
  if (currentBlock.x + currentBlock.width > canvas.width || currentBlock.x < 0) {
    direction *= -1;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw stacked blocks
  blocks.forEach((b) => {
    ctx.fillStyle = "#0ABAB5";       // stacked block fill
    ctx.fillRect(b.x, b.y, b.width, b.height);

    ctx.strokeStyle = "#FFEDF3";     // stacked block border
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, b.y, b.width, b.height);
  });

  // Draw current moving block
  ctx.fillStyle = "#FFEDF3";         // moving block fill
  ctx.fillRect(currentBlock.x, currentBlock.y, currentBlock.width, currentBlock.height);

  ctx.strokeStyle = "#0ABAB5";       // moving block border
  ctx.lineWidth = 2;
  ctx.strokeRect(currentBlock.x, currentBlock.y, currentBlock.width, currentBlock.height);
}



canvas.addEventListener("click", placeBlock);

function placeBlock() {
  if (!gameRunning) return;

  const prev = blocks[blocks.length - 1];
  const dx = currentBlock.x - prev.x;
  const overlap = currentBlock.width - Math.abs(dx);

  if (overlap <= 0) {
    endGame();
    return;
  }

  currentBlock.width = overlap;
  currentBlock.x = dx >= 0 ? currentBlock.x : prev.x;
  blocks.push({ ...currentBlock });

  spawnBlock();
  score++;
  scoreDisplay.textContent = `Score: ${score}`;

  if (score % 5 === 0) speed += 0.5;
}

function endGame() {
  console.log("Game ended. Saving score..."); 
  gameRunning = false;
  cancelAnimationFrame(animationId);
  finalScore.textContent = score;
  gameOverMessage.classList.remove("hidden");

  const username = localStorage.getItem("username");
  console.log("Username:", username); 
  if (!username) {
    console.error("⚠️ No username found. Please log in to save score.");
    return;
  }

  saveScoreToLeaderboard("BlockStacker", username, score);
}


function restartGame() {
  dropdown.classList.add("hidden");
  startGame();
}

function backToMenu() {
  cancelAnimationFrame(animationId);
  gameRunning = false;
  intro.classList.remove("hidden");
  gameContainer.classList.add("hidden");
  menuBtn.classList.add("hidden");
  gameOverMessage.classList.add("hidden");
}

function showInstructions() {
  alert("Tap or click to drop a block.Align it carefully with the one below.\nThe more precise you are, the longer you can stack!\nGood luck!");
  dropdown.classList.add("hidden");
}

document.addEventListener("click", (event) => {
  const isClickInside = menuToggleBtn.contains(event.target) || dropdown.contains(event.target);
  if (!isClickInside) {
    dropdown.classList.add("hidden");
  }
});

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
