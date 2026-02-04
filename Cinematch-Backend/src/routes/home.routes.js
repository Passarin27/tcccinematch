const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware } = require('../controllers/auth.controller');
const MAPA_GENEROS_TMDB = require('../utils/generosTMDB');

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

    // Converte nomes dos gêneros em IDs do TMDB
    const generosIds = usuario.generos_prediletos
      .map(g => MAPA_GENEROS_TMDB[g.toLowerCase()])
      .filter(Boolean);

    if (!generosIds.length) {
      console.log('Nenhum gênero válido:', usuario.generos_prediletos);
      return res.json([]);
    }

    const generos = generosIds.join(',');
    const page = req.query.page || 1;

    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&with_genres=${generos}&page=${page}`;

    console.log('URL TMDB:', url);

    const response = await fetch(url);
    const dados = await response.json();

    res.json(dados.results || []);

  } catch (err) {
    console.error('Erro recomendações:', err);
    res.status(500).json({ error: 'Erro ao gerar recomendações' });
  }
});

module.exports = router;
