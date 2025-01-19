const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();




app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend.vercel.app'], // Replace with your frontend URLs
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, 
}));
app.use(bodyParser.json());


mongoose
  .connect('mongodb+srv://catci142:catci142@cluster0.oyfmupl.mongodb.net/auth?retryWrites=true&w=majority&appName=Cluster0/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalPoints: { type: Number, default: 0 },
});

const User = mongoose.model('User', userSchema);


const claimHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  claimedPoints: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ClaimHistory = mongoose.model('ClaimHistory', claimHistorySchema);


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
  



app.get('/users', async (req, res) => {
  try {
    console.log("here");
    const users = await User.find().sort({ totalPoints: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/claim-points', async (req, res) => {
  try {
    const { userId } = req.body;

    
    const randomPoints = Math.floor(Math.random() * 10) + 1;

    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    
    user.totalPoints += randomPoints;
    await user.save();

   
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


app.get('/claim-history', async (req, res) => {
  try {
    const history = await ClaimHistory.find().sort({ timestamp: -1 });
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
