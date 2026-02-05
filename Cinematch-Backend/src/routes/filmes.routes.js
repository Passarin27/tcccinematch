const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware } = require('../controllers/auth.controller');

/* =========================
   FUNÇÃO AUXILIAR – LISTAS
========================= */
async function obterOuCriarLista(nome, usuario_id) {
  let { data: lista } = await supabase
    .from('listas')
    .select('*')
    .eq('usuario_id', usuario_id)
    .eq('nome', nome)
    .single();

  if (!lista) {
    const { data } = await supabase
      .from('listas')
      .insert([{ nome, usuario_id }])
      .select()
      .single();

    lista = data;
  }

  return lista;
}

/* =========================
   FUNÇÃO AUXILIAR – TMDB
========================= */
async function buscarFilmeTMDB(tmdb_id) {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdb_id}?language=pt-BR`,
    {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!res.ok) {
    throw new Error('Erro ao buscar filme no TMDB');
  }

  return await res.json();
}

/* =========================
   DETALHES DO FILME
========================= */
router.get('/detalhes/:tmdbId', authMiddleware, async (req, res) => {
  try {
    const filme = await buscarFilmeTMDB(req.params.tmdbId);
    res.json(filme);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar detalhes' });
  }
});

/* =========================
   STATUS DO FILME
========================= */
router.get('/status/:tmdbId', authMiddleware, async (req, res) => {
  const { tmdbId } = req.params;
  const userId = req.user.id;

  const { data: filme } = await supabase
    .from('filmes_salvos')
    .select('id')
    .eq('tmdb_id', tmdbId)
    .single();

  if (!filme) {
    return res.json({ assistirDepois: false, jaAssistido: false });
  }

  const { data: listas = [] } = await supabase
    .from('lista_filmes')
    .select(`listas!inner ( nome, usuario_id )`)
    .eq('filme_id', filme.id)
    .eq('listas.usuario_id', userId);

  const nomes = listas.map(l => l.listas.nome);

  res.json({
    assistirDepois: nomes.includes('Assistir depois'),
    jaAssistido: nomes.includes('Já assistidos')
  });
});

/* =========================
   ASSISTIR DEPOIS
========================= */
router.post('/assistir-depois', authMiddleware, async (req, res) => {
  try {
    const { tmdb_id } = req.body;
    const userId = req.user.id;

    const filmeTMDB = await buscarFilmeTMDB(tmdb_id);

    const listaAssistirDepois = await obterOuCriarLista('Assistir depois', userId);
    const listaJaAssistidos = await obterOuCriarLista('Já assistidos', userId);

    const { data: filme } = await supabase
      .from('filmes_salvos')
      .upsert([{
        tmdb_id,
        titulo: filmeTMDB.title,
        poster: filmeTMDB.poster_path
      }])
      .select()
      .single();

    await supabase
      .from('lista_filmes')
      .delete()
      .eq('lista_id', listaJaAssistidos.id)
      .eq('filme_id', filme.id);

    await supabase
      .from('lista_filmes')
      .upsert(
        [{ lista_id: listaAssistirDepois.id, filme_id: filme.id }],
        { onConflict: 'lista_id,filme_id' }
      );

    res.status(201).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar filme' });
  }
});

/* =========================
   JÁ ASSISTIDOS
========================= */
router.post('/ja-assistidos', authMiddleware, async (req, res) => {
  try {
    const { tmdb_id } = req.body;
    const userId = req.user.id;

    const filmeTMDB = await buscarFilmeTMDB(tmdb_id);

    const listaJaAssistidos = await obterOuCriarLista('Já assistidos', userId);
    const listaAssistirDepois = await obterOuCriarLista('Assistir depois', userId);

    const { data: filme } = await supabase
      .from('filmes_salvos')
      .upsert([{
        tmdb_id,
        titulo: filmeTMDB.title,
        poster: filmeTMDB.poster_path
      }])
      .select()
      .single();

    await supabase
      .from('lista_filmes')
      .delete()
      .eq('lista_id', listaAssistirDepois.id)
      .eq('filme_id', filme.id);

    await supabase
      .from('lista_filmes')
      .upsert(
        [{ lista_id: listaJaAssistidos.id, filme_id: filme.id }],
        { onConflict: 'lista_id,filme_id' }
      );

    res.status(201).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar filme' });
  }
});

module.exports = router;
