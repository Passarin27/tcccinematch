const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware } = require('../controllers/auth.controller');

const MAPA_GENEROS_TMDB = require('../utils/generosTMDB');

const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  console.error('❌ TMDB_API_KEY não definida nas variáveis de ambiente');
}

/* =========================
   HOME / RECOMENDAÇÕES
========================= */
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (!TMDB_API_KEY) {
      return res.status(500).json({ error: 'Configuração inválida do servidor' });
    }

    const userId = req.user.id;

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('preferences')
      .eq('id', userId)
      .single();

    if (error || !usuario?.preferences?.length) {
      return res.json([]);
    }

    const generosIds = usuario.preferences
      .map(g => MAPA_GENEROS_TMDB[g])
      .filter(Boolean);

    if (!generosIds.length) {
      console.log('⚠️ Gêneros não mapeados:', usuario.preferences);
      return res.json([]);
    }

    const generos = generosIds.join(',');
    const page = req.query.page || 1;

    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&with_genres=${generos}&page=${page}`;

    console.log('TMDB URL:', url);

    const response = await fetch(url);
    const dados = await response.json();

    return res.json(dados.results || []);

  } catch (err) {
    console.error('❌ Erro recomendações:', err);
    return res.status(500).json({ error: 'Erro ao gerar recomendações' });
  }
});

module.exports = router;
