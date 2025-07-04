const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const authRoutes = require('./routes/auth'); // adjust path as needed

const Score = require("./models/Score");

require('dotenv').config();

const app = express();
const PORT = 5000;

// ✅ Middleware setup
app.use(cors());
app.use(bodyParser.json());
// OR just use this if not using body-parser explicitly:
app.use(express.json());
app.use('/api', authRoutes); // Mounts all /login routes under /api

// ✅ MongoDB connection
mongoose.connect('mongodb://localhost:27017/arcade', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// ✅ POST route to register user
app.post('/api/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // ✅ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Save new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error", error });
  }
});



//Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful!", token: "dummy-token",username: user.username }); // replace with real JWT if needed
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Example POST route to store score
app.post("/api/submit-score", async (req, res) => {
  const { username, game, score } = req.body;
  console.log("New score received:", username, game, score); 
  if (!username || !game || score == null) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newScore = new Score({ username, game, score });
    await newScore.save();
    res.status(201).json({ message: "Score saved!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save score", details: err });
  }
});

// ========== Get Top Scores ==========
app.get("/api/leaderboard/:game", async (req, res) => {
  const game = req.params.game;
  try {
    const topScores = await Score.find({ game })
      .sort({ score: -1 })
      .limit(10);

      // Map to only username and score
    const response = topScores.map(score => ({
      username: score.username,
      score: score.score
    }));
    
    res.json(topScores);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// ✅ Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));