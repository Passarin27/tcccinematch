const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware } = require('../controllers/auth.controller');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

/* =========================
   GET /users/me
========================= */
router.get('/me', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, email, foto, preferences')
    .eq('id', req.user.id)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

/* =========================
   PUT /users/me
========================= */
router.put('/me', authMiddleware, async (req, res) => {
  const { nome, email, senha, foto, preferences } = req.body;
  const dados = {};

  if (nome) dados.nome = nome;
  if (email) dados.email = email;
  if (foto) dados.foto = foto;

  if (Array.isArray(preferences)) {
    dados.preferences = preferences;
  }

  if (senha) {
    dados.senha = await bcrypt.hash(senha, 10);
  }

  const { data, error } = await supabase
    .from('usuarios')
    .update(dados)
    .eq('id', req.user.id)
    .select('id, nome, email, foto, preferences')
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

    const fotoUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/Avatares/${fileName}?t=${Date.now()}`;

    await supabase
      .from('usuarios')
      .update({ foto: fotoUrl })
      .eq('id', req.user.id);

    res.json({ foto: fotoUrl });
  }
);

/* =========================
   DELETE /users/me/avatar
========================= */
router.delete('/me/avatar', authMiddleware, async (req, res) => {
  const fileName = `${req.user.id}.png`;

  await supabase.storage
    .from('Avatares')
    .remove([fileName]);

  await supabase
    .from('usuarios')
    .update({ foto: null })
    .eq('id', req.user.id);

  res.status(204).send();
});


module.exports = router;







