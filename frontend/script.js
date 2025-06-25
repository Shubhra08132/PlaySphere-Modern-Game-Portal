document.addEventListener("DOMContentLoaded", function () {
  // ✅ LOGIN FORM - only if it exists on the page
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        alert("Login successful!");
        window.location.href = "index.html";
      } else {
        alert(data.message);
      }
    });
  }

  // ✅ SEARCH - only on homepage with search
  const searchInput = document.querySelector('.search-bar');
  const gameCards = document.querySelectorAll('.game-card');

  if (searchInput && gameCards.length) {
    searchInput.addEventListener('input', function () {
      const searchText = searchInput.value.toLowerCase();
      gameCards.forEach(card => {
        const title = card.querySelector('h1').innerText.toLowerCase();
        card.style.display = title.includes(searchText) ? 'block' : 'none';
      });
    });
  }

  // ✅ START GAME (scroll down)
  const startGameBtn = document.querySelector('.buttons button:nth-child(2)');
  const gamesSection = document.querySelector('.games');

  if (startGameBtn && gamesSection) {
    startGameBtn.addEventListener('click', () => {
      window.scrollTo({
        top: gamesSection.offsetTop,
        behavior: 'smooth'
      });
    });
  }

  // ✅ GAME CARD hover logging
  const cards = document.querySelectorAll('.game-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      console.log('Hovered:', card.querySelector('h1').innerText);
    });
  });

  // ✅ PROFILE / NAVBAR update with token
  const token = localStorage.getItem('token');
  if (token) {
    fetch("http://localhost:5000/api/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      })
      .then(user => {
        const usernameEl = document.getElementById("username-display");
        const userInfo = document.getElementById("user-info");
        const signInLink = document.getElementById("signin-link");

        if (usernameEl && userInfo && signInLink) {
          usernameEl.innerText = user.username;
          userInfo.style.display = "flex";
          signInLink.style.display = "none";
        }
      })
      .catch(err => {
        console.log("Token invalid or expired");
        localStorage.removeItem("token");
      });
  }
});
