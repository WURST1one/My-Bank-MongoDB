const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');


/* Configurando a conexão das portas do Banco de dados */
const app = express();
const PORT = 5000;
const MONGO_URI = 'mongodb://localhost:27017/mydatabase';

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static(path.join(__dirname, 'public')));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

/* Definindo ID para cada usuario criado */
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', counterSchema);

/* Nome, id e email */
const userSchema = new mongoose.Schema({
  _id: Number,
  name: String,
  email: String,
});
const User = mongoose.model('User', userSchema);

/* ID continuo  */
async function getNextSequenceValue(sequenceName) {
  const sequenceDocument = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.seq;
}

/* Salvando usuario */
app.post('/api/save', async (req, res) => {
  const { name, email } = req.body;

  try {
    const newId = await getNextSequenceValue('user_id');

    const newUser = new User({ _id: newId, name, email });

    await newUser.save();
    res.status(200).json({ message: 'User saved successfully!' });

    /* Error ao criar usuario */
  } catch (error) {
    res.status(500).json({ error: 'Failed to save user' });
  }
});

/* Porta do servidor: 5000 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
