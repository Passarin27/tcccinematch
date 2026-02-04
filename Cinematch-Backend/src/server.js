require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('Servidor iniciando...');

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'API CineMatch rodando 🚀' });
});

app.use('/auth', require('./routes/auth.routes'));
app.use('/users', require('./routes/users.routes'));
app.use('/filmes', require('./routes/filmes.routes'));
app.use('/listas', require('./routes/listas.routes'));
app.use('/home', require('./routes/home.routes'));

/* =========================
   START SERVER (RENDER)
========================= */
const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});



