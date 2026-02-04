const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/* =========================
   AUTH MIDDLEWARE (JWT)
========================= */
const authMiddleware = (req, res, next) => {
  console.log('🔐 Auth middleware executado');

  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader);

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não informado' });
  }

  const [, token] = authHeader.split(' ');
  console.log('Token recebido:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);

    req.user = decoded;
    return next();
  } catch (err) {
    console.log('❌ Erro ao validar token:', err.message);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

/* =========================
   REGISTER
========================= */
const register = async (req, res) => {
  let { nome, email, senha, preferences } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Dados obrigatórios' });
  }

  if (!Array.isArray(preferences)) {
    preferences = [];
  }

  try {
    email = email.toLowerCase().trim();

    const senhaHash = await bcrypt.hash(senha, 10);

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nome,
        email,
        senha: senhaHash,
        preferences
      }])
      .select('id, nome, email, preferences')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso',
      user: data
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   LOGIN
========================= */
const login = async (req, res) => {
  let { email, senha } = req.body;

  try {
    email = email.toLowerCase().trim();

    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id, email, senha')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   EXPORTS
========================= */
module.exports = {
  authMiddleware,
  register,
  login
};

