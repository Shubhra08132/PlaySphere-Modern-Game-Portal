document.addEventListener("DOMContentLoaded", () => {
  const gameSelector = document.getElementById("game-selector");
  const leaderboardBody = document.getElementById("leaderboard-body");

  const username = localStorage.getItem("username");
  if (!username) {
   console.warn("No username found. Please log in to save score.");
   // Optional: Redirect to login page
  }

   const token = localStorage.getItem('token');

  if (token) {
    fetch("http://localhost:5000/api/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject("Invalid token"))
      .then(user => {
        const usernameEl = document.getElementById("username-display");
        if (usernameEl) {
          usernameEl.innerText = user.username;  // Show the username
        }
      })
      .catch(err => {
        console.log("Token invalid or expired");
        localStorage.removeItem("token");
      });
    }



  // Sample fallback data if nothing in localStorage
  const fallbackData = {
    "Flip And Match": [
      { username: "Alice", score: 45 },
      { username: "Bob", score: 38 },
      { username: "Clara", score: 35 }
    ],
    "Snake Retro": [
      { username: "Charlie", score: 900 },
      { username: "Dave", score: 850 },
      { username: "Eva", score: 800 }
    ],
    "BlockStacker": [],
    "Maze-Escape": [],
    "BrickBreaker": []
  };

  // Load leaderboard from localStorage or fallback
  const getLeaderboardData = () => {
    const stored = localStorage.getItem("arcadeLeaderboard");
    return stored ? JSON.parse(stored) : fallbackData;
  };

  // Save leaderboard (can be used after game ends)
  const saveLeaderboardData = (data) => {
    localStorage.setItem("arcadeLeaderboard", JSON.stringify(data));
  };

  // Renders table for selected game
  function updateLeaderboard(game) {
    fetch(`http://localhost:5000/api/leaderboard/${game}`)
      .then(res => res.json())
      .then(scores => {
        leaderboardBody.innerHTML = "";
        
        if (!scores.length) {
          leaderboardBody.innerHTML = `<tr><td colspan="3">No scores available yet.</td></tr>`;
          return;
        }
     const timeBasedGames = ["Flip And Match", "Maze-Escape"];
      if (timeBasedGames.includes(game)) {
        scores.sort((a, b) => a.score - b.score); // Ascending (lower is better)
      } else {
        scores.sort((a, b) => b.score - a.score); // Descending (higher is better)
      }

// 1. Filter to keep only the highest score per user
const highestScores = {};
scores.forEach(entry => {
  const { username, score } = entry;
  if (!highestScores[username] || score > highestScores[username]) {
    highestScores[username] = score;
  }
});

// 2. Convert the object back to a sorted array
const uniqueScores = Object.entries(highestScores)
  .map(([username, score]) => ({ username, score }))
  .sort((a, b) => b.score - a.score);

// 3. Render the table
leaderboardBody.innerHTML = "";
uniqueScores.forEach((entry, index) => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${index + 1}</td>
    <td>${entry.username}</td>
    <td>${entry.score}</td>
  `;
  leaderboardBody.appendChild(row);
});

    })
    .catch(err => console.error("Error fetching leaderboard:", err));
}

  // Event listener for game switch
  gameSelector.addEventListener("change", (e) => {
    updateLeaderboard(e.target.value);
  });

  // Initial load
  updateLeaderboard(gameSelector.value);
});