const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware } = require('../controllers/auth.controller');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const TMDB_API_KEY = process.env.TMDB_API_KEY;

/* =========================
   HOME / RECOMENDAÇÕES
========================= */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('generos_prediletos')
      .eq('id', userId)
      .single();

    if (error || !usuario?.generos_prediletos?.length) {
      return res.json([]);
    }

    const generos = usuario.generos_prediletos.join(',');

    const page = req.query.page || 1;
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${'1ed547b4243d008478f0754b4621dbe2'}&language=pt-BR&with_genres=${generos}&page=${page}`;

    const response = await fetch(url);
    const dados = await response.json();

    res.json(dados.results || []);

  } catch (err) {
    console.error('Erro recomendações:', err);
    res.status(500).json({ error: 'Erro ao gerar recomendações' });
  }
});

module.exports = router;
