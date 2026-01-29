const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middlewares/auth.middleware');

/* =========================
   GET /users/me
========================= */
router.get('/me', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, email, foto, criado_em')
    .eq('id', req.user.id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

/* =========================
   PUT /users/me
========================= */
const bcrypt = require('bcryptjs');

router.put('/me', authMiddleware, async (req, res) => {
  const { nome, email, foto, senha } = req.body;

  try {
    const dadosAtualizar = {};

    if (nome) dadosAtualizar.nome = nome;
    if (email) dadosAtualizar.email = email;
    if (foto) dadosAtualizar.foto = foto;

    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      dadosAtualizar.senha = senhaHash;
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update(dadosAtualizar)
      .eq('id', req.user.id)
      .select('id, nome, email, foto')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
