const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middlewares/auth.middleware');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

/* =========================
   GET /users/me
========================= */
router.get('/me', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, email, foto')
    .eq('id', req.user.id)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

/* =========================
   PUT /users/me
========================= */
router.put('/me', authMiddleware, async (req, res) => {
  const { nome, email, senha, foto } = req.body;
  const dados = {};

  if (nome) dados.nome = nome;
  if (email) dados.email = email;
  if (foto) dados.foto = foto;

  if (senha) {
    dados.senha = await bcrypt.hash(senha, 10);
  }

  const { data, error } = await supabase
    .from('usuarios')
    .update(dados)
    .eq('id', req.user.id)
    .select('id, nome, email, foto')
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

/* =========================
   POST /users/me/avatar
========================= */
router.post(
  '/me/avatar',
  authMiddleware,
  upload.single('foto'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não enviado' });
    }

    const fileName = `${req.user.id}.png`;

    const { error: uploadError } = await supabase.storage
      .from('Avatares')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message });
    }

    const { data } = supabase.storage
      .from('Avatares')
      .getPublicUrl(fileName);

    const fotoUrl = data.publicUrl;

    await supabase
      .from('usuarios')
      .update({ foto: fotoUrl })
      .eq('id', req.user.id);

    res.json({ foto: fotoUrl });
  }
);

module.exports = router;
