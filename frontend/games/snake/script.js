const mainMenu = document.getElementById('main-menu');
const gameDiv = document.getElementById('game');
const canvas = document.getElementById("gameCanvas");
const eatSound = document.getElementById("eatSound");
const gameOverSound = document.getElementById("gameOverSound");
const ctx = canvas.getContext("2d");
const box = 20; // Each square is 20x20 px
const canvasSize = 400;
let score = 0;

// Snake array: starts with 1 segment
let snake = [{ x: 160, y: 200 }];
let direction = "RIGHT";

// Food (random initial position)
let food = generateSafeFood();


let speed = 200; // start speed (200ms)
let game; // Declare variable but don't start yet

function startGame() {
  if (game) clearInterval(game);
  game = setInterval(draw, speed);
}

function goBack() {
  gameDiv.style.display = 'none';
  mainMenu.style.display = 'block';
  document.getElementById("gameOverMessage").style.display = "none"; // hide game over msg
  clearInterval(game); // stop game loop
  game = null;         // reset game state
  score = 0;
  snake = [{ x: 160, y: 200 }];
  direction = "RIGHT";
  document.getElementById("score").innerText = "Score: 0";
}



// Control the snake
document.addEventListener("keydown", changeDirection);

function changeDirection(e) {
  if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  else if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  else if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  else if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
}
function drawDottedBackground() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  ctx.fillStyle = "#444";
  let dotSpacing = box;
  let dotRadius = 2;

  for (let x = dotRadius; x < canvasSize; x += dotSpacing) {
    for (let y = dotRadius; y < canvasSize; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
function generateSafeFood() {
  const maxIndex = (canvasSize / box) - 2;
  const minIndex = 1;

  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * (maxIndex - minIndex + 1) + minIndex) * box,
      y: Math.floor(Math.random() * (maxIndex - minIndex + 1) + minIndex) * box,
    };
  } while (collision(newFood.x, newFood.y, snake)); // prevent food on snake

  return newFood;
}



function draw() {
    drawDottedBackground();

  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.beginPath();
ctx.arc(snake[i].x + box / 2, snake[i].y + box / 2, box / 2, 0, Math.PI * 2);
ctx.fillStyle = i === 0 ? "#76ff03" : "#b2ff59";
ctx.fill();
ctx.closePath();

  }

  // Draw food
 ctx.beginPath();
ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, Math.PI * 2);
ctx.fillStyle = "#ff5252";
ctx.fill();
ctx.closePath();


  // Move snake
  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "LEFT") headX -= box;
  if (direction === "RIGHT") headX += box;
  if (direction === "UP") headY -= box;
  if (direction === "DOWN") headY += box;

  // Game Over: hit wall or self
  if (
    headX < 0 || headY < 0 ||
    headX >= canvasSize || headY >= canvasSize ||
    collision(headX, headY, snake)
  ) {
    clearInterval(game);
    gameOverSound.play();
    document.getElementById("finalScore").innerText = "Your Score: " + score;
    document.getElementById("gameOverMessage").style.display = "block";

  }

 
  // Eat food
  if (headX === food.x && headY === food.y) {
    score++;
    eatSound.currentTime = 0;
    eatSound.play(); 
    document.getElementById("score").innerText = "Score: " + score;

    food = generateSafeFood();

     // Increase speed - make delay smaller, but not too small
    if (speed > 50) {   // set a minimum speed limit (e.g., 50ms)
    speed -= 10;      // decrease delay by 10ms for each food eaten
    startGame();      // restart game with new speed
    } 
 } else {
    snake.pop(); // Remove tail if not eating
  }

  // Add new head
  const newHead = { x: headX, y: headY };
  snake.unshift(newHead);
}

function collision(x, y, array) {
  return array.some(segment => segment.x === x && segment.y === y);
}

// Restart button
document.getElementById("restartBtn").addEventListener("click", () => {
  location.reload();
});
//Start Button
document.getElementById("startBtn").addEventListener("click", () => {
  mainMenu.style.display = "none";   // hide menu
  gameDiv.style.display = "block";   // show game
  startGame();                       // start game
});

//Resume Button
let isPaused = false;

document.getElementById("pauseResumeBtn").addEventListener("click", () => {
  if (!game) return; // if game hasn't started, do nothing

  if (isPaused) {
    startGame(); // resume
    document.getElementById("pauseResumeBtn").innerText = "Pause";
    isPaused = false;
  } else {
    clearInterval(game); // pause
    document.getElementById("pauseResumeBtn").innerText = "Resume";
    isPaused = true;
  }
});


