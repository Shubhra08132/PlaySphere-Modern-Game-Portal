// ========== Intro screen ========== //
document.getElementById("start-btn").addEventListener("click", () => {
  document.getElementById("intro-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");
  startGame();
});

// Show/hide menu panel toggle
let menuVisible = false;

document.getElementById("menu-btn").addEventListener("click", () => {
  menuVisible = !menuVisible;
  document.getElementById("menu-panel").style.display = menuVisible ? "block" : "none";
});

// Example for restart and instructions:
function toggleMenu() {
  alert("Match all the cards by flipping them two at a time. Good luck!");
  document.getElementById("menu-panel").style.display = "none";
  menuVisible = false;
}

function restartGame() {
  startGame(); // reuse the function
  document.getElementById("menu-panel").style.display = "none";
  menuVisible = false;
}


// ========== Core Game Logic ========== //
const emojis = ['🍎', '🐶', '🌟', '⚽', '🎵', '🚀', '🎲', '🍩'];
let flippedCards = [];
let matchedPairs = 0;
let lockBoard = false;

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function startGame() {
  startTimer();
  document.getElementById("start-btn").style.display = "none"; 
  const gameBoard = document.querySelector(".game-board");
  gameBoard.innerHTML = ""; // Clear previous cards

  const shuffledEmojis = shuffle([...emojis, ...emojis]);
  flippedCards = [];
  matchedPairs = 0;
  lockBoard = false;
  document.getElementById("status").textContent = ""; // Reset status

  shuffledEmojis.forEach((emoji) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back">${emoji}</div>
      </div>
    `;
    card.dataset.emoji = emoji;
    card.addEventListener("click", handleFlip);
    gameBoard.appendChild(card);
  });

  document.getElementById("menu-panel").classList.add("hidden");
}

function handleFlip(e) {
  const card = e.currentTarget;
  if (lockBoard || card.classList.contains("matched") || card.classList.contains("flipped")) return;

  card.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    lockBoard = true;
    const [first, second] = flippedCards;

    if (first.dataset.emoji === second.dataset.emoji) {
      first.classList.add("matched");
      second.classList.add("matched");
      matchedPairs++;

      if (matchedPairs === emojis.length) {
        document.getElementById("status").textContent = "🎉 You matched all pairs!";
        stopTimer();
      }

      resetTurn();
    } else {
      setTimeout(() => {
        first.classList.remove("flipped");
        second.classList.remove("flipped");
        resetTurn();
      }, 800);
    }
  }
}

function resetTurn() {
  flippedCards = [];
  lockBoard = false;
}

let timerInterval;
let secondsElapsed = 0;

function startTimer() {
  clearInterval(timerInterval); // just in case
  secondsElapsed = 0;
  document.getElementById("timer").textContent = `Time: 0s`;
  timerInterval = setInterval(() => {
    secondsElapsed++;
    document.getElementById("timer").textContent = `Time: ${secondsElapsed}s`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

