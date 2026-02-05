const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware } = require('../controllers/auth.controller');

const MAPA_GENEROS_TMDB = require('../utils/generosTMDB');
const TMDB_API_KEY = process.env.TMDB_API_KEY;

/* =========================
   HOME / RECOMENDAÇÕES
========================= */
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!TMDB_API_KEY) {
      return res.status(500).json({ error: 'TMDB_API_KEY não configurada' });
    }

    const userId = req.user.id;

    /* =========================
       PREFERÊNCIAS DO USUÁRIO
    ========================= */
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('preferences')
      .eq('id', userId)
      .single();

    if (!usuario?.preferences?.length) {
      return res.json([]);
    }

    const normalizarGenero = (g) =>
      g
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, '_');

    const generosIds = usuario.preferences
      .map(g => MAPA_GENEROS_TMDB[normalizarGenero(g)])
      .filter(Boolean);

    if (!generosIds.length) {
      return res.json([]);
    }

    /* =========================
       FILMES JÁ SALVOS
    ========================= */
    const { data: filmesSalvos = [] } = await supabase
      .from('filmes_salvos')
      .select('tmdb_id')
      .eq('usuario_id', userId);

    const idsSalvos = filmesSalvos.map(f => Number(f.tmdb_id));

    /* =========================
       BUSCA TMDB
    ========================= */
    const generos = generosIds.join(',');
    const page = req.query.page || 1;

    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&with_genres=${generos}&page=${page}`;

    const response = await fetch(url);
    if (!response.ok) return res.json([]);

    const dados = await response.json();

    /* =========================
       FILTRAR JÁ MARCADOS
    ========================= */
    const recomendacoes = (dados.results || []).filter(
      filme => !idsSalvos.includes(filme.id)
    );

    return res.json(recomendacoes);

  } catch (err) {
    console.error('Erro recomendações:', err);
    return res.status(500).json({ error: 'Erro ao gerar recomendações' });
  }
});

module.exports = router;
