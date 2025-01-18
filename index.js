const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize the app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect('mongodb+srv://catci142:catci142@cluster0.oyfmupl.mongodb.net/auth?retryWrites=true&w=majority&appName=Cluster0/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// User Schema and Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalPoints: { type: Number, default: 0 },
});

const User = mongoose.model('User', userSchema);

// Claim Points History Schema and Model
const claimHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  claimedPoints: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ClaimHistory = mongoose.model('ClaimHistory', claimHistorySchema);

// Routes

// 1. Create a new user

// app.get('/users', (req, res) => {
//     res.json({ message: 'Users route working' });
//     console.log("this is working : ");
// });

app.post('/users', async (req, res) => {
    try {
      const { name } = req.body;
      console.log(name);
      const user = new User({ name });
      await user.save();
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

// 2. Get all users (sorted by total points)

// app.get('/claim-history', async (req, res) => {
//   try {
//       const users = await User.find();
//       const history = users.reduce((acc, user) => {
//           acc[user._id] = user.claimHistory;
//           return acc;
//       }, {});
//       res.json(history);
//   } catch (err) {
//       res.status(500).json({ error: err.message });
//   }
// });

app.get('/users', async (req, res) => {
  try {
    console.log("here");
    const users = await User.find().sort({ totalPoints: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Claim points for a user
app.post('/claim-points', async (req, res) => {
  try {
    const { userId } = req.body;

    // Generate random points between 1 and 10
    const randomPoints = Math.floor(Math.random() * 10) + 1;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user's total points
    user.totalPoints += randomPoints;
    await user.save();

    // Log the claim in history
    const history = new ClaimHistory({
      userId: user._id,
      userName: user.name,
      claimedPoints: randomPoints,
    });
    await history.save();

    res.status(200).json({ user, claimedPoints: randomPoints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get claim history
app.get('/claim-history', async (req, res) => {
  try {
    const history = await ClaimHistory.find().sort({ timestamp: -1 });
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
