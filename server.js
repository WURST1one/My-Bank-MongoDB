const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;
const MONGO_URI = 'mongodb://localhost:27017/mydatabase';

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(MONGO_URI);

app.use(express.static(path.join(__dirname, 'public')));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model('User', userSchema);

app.post('/api/save', async (req, res) => {
  const { name, email } = req.body;

  const newUser = new User({ name, email });

  try {
    await newUser.save();
    res.status(200).json({ message: 'User saved successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save user' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
