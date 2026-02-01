const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../controllers/auth.controller');

/* =========================
   CRIAR / OBTER FILME
========================= */
router.post('/', authMiddleware, async (req, res) => {
  const { tmdb_id, titulo, poster } = req.body;

  if (!tmdb_id || !titulo || !poster) {
    return res.status(400).json({ error: 'Dados do filme obrigatórios' });
  }

  // verifica se o filme já existe
  let { data: filme } = await supabase
    .from('filmes_salvos')
    .select('*')
    .eq('tmdb_id', tmdb_id)
    .single();

  // se não existir, cria
  if (!filme) {
    const { data, error } = await supabase
      .from('filmes_salvos')
      .insert([{ tmdb_id, titulo, poster }])
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    filme = data;
  }

  res.status(201).json(filme);
});

/* =========================
   LISTAR FILMES SALVOS
========================= */
router.get('/', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('filmes_salvos')
    .select('*')
    .order('criado_em', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

/* =========================
   REMOVER FILME
========================= */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('filmes_salvos')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(204).send();
});

module.exports = router;


