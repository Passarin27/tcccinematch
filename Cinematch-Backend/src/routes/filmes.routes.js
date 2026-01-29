const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/', authMiddleware, async (req, res) => {
  const { tmdb_id, titulo, poster } = req.body;

  const { data, error } = await supabase
    .from('filmes_salvos')
    .insert([{
      usuario_id: req.user.id,
      tmdb_id,
      titulo,
      poster
    }])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(data);
});
router.get('/', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('filmes_salvos')
    .select('*')
    .eq('usuario_id', req.user.id)
    .order('criado_em', { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

// remover filme salvo
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('filmes_salvos')
    .delete()
    .eq('id', id)
    .eq('usuario_id', req.user.id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(204).send();
});

module.exports = router;
