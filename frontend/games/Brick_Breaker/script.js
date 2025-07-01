// ======== Menu & Screens ======== //
const startBtn = document.getElementById('start-btn');
const introScreen = document.getElementById('intro-screen');
const gameScreen = document.getElementById('game-screen');
const menuBtn = document.getElementById('menu-btn');
const menuPanel = document.getElementById('menu-panel');
const statusText = document.getElementById('status');

// ======== Start Game ======== //
startBtn.addEventListener('click', () => {
  introScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  startBtn.classList.add('hidden');
menuPanel.style.display = 'none'; // always hide the menu when game starts
  startGame();
});

// ======== Toggle Menu ======== //
menuBtn.addEventListener('click', () => {
  menuPanel.style.display = menuPanel.style.display === 'block' ? 'none' : 'block';
});

// ======== Menu Actions ======== //
function showInstructions() {
  alert("Use LEFT and RIGHT arrow keys to move the paddle. Bounce the ball to break all the bricks. Don't let the ball fall!");
  menuPanel.style.display = 'none';
}

function restartGame() {
  document.location.reload();
}

// ======== Brick Breaker Game ======== //
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
const ballRadius = 10;

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;

// Bricks
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

// Score & Lives
let score = 0;
let lives = 3;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
        const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
          dy = -dy;

          dx += (Math.random() - 0.5) * 0.2;
          if (dx > 4) dx = 4;
          if (dx < -4) dx = -4;

          b.status = 0;
          score++;

          if (score === brickRowCount * brickColumnCount) {
            statusText.textContent = "🎉 YOU WIN!";
            setTimeout(() => {
              document.location.reload();
            }, 2000);
          }
        }
      }
    }
  }
}

function updateHUD() {
  document.getElementById('lives-display').textContent = "Lives: " + lives;
  document.getElementById('score-display').textContent = "Score: " + score;
}


function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();
   updateHUD();

  if (y + dy < ballRadius) dy = -dy;
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;

  if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;

      dx += (Math.random() - 0.5) * 0.5;
      if (dx > 4) dx = 4;
      if (dx < -4) dx = -4;

    } else {
      lives--;
      if (!lives) {
        statusText.textContent = "💀 GAME OVER";
        setTimeout(() => {
          document.location.reload();
        }, 2000);
      } else {
        x = canvas.width / 2;
        y = canvas.height - 30;
        dx = 2;
        dy = -2;
        paddleX = (canvas.width - paddleWidth) / 2;
      }
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
  else if (leftPressed && paddleX > 0) paddleX -= 7;

  x += dx;
  y += dy;

  requestAnimationFrame(draw);
}

function startGame() {
  draw();
  statusText.textContent = "";
}
