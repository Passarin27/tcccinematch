const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authMiddleware } = require('../controllers/auth.controller');

/* =========================
   FUNÇÃO AUXILIAR
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
   STATUS DO FILME (CORRIGIDO)
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

  const { data: listas } = await supabase
    .from('lista_filmes')
    .select(`
      listas!inner (
        nome,
        usuario_id
      )
    `)
    .eq('filme_id', filme.id)
    .eq('listas.usuario_id', userId);

  const nomes = listas.map(l => l.listas.nome);

  res.json({
    assistirDepois: nomes.includes('Assistir depois'),
    jaAssistido: nomes.includes('Já assistidos')
  });
});

/* =========================
   SALVAR FILME (SE NÃO EXISTIR)
========================= */
router.post('/', authMiddleware, async (req, res) => {
  const { tmdb_id, titulo, poster } = req.body;

  let { data: filme } = await supabase
    .from('filmes_salvos')
    .select('*')
    .eq('tmdb_id', tmdb_id)
    .single();

  if (!filme) {
    const { data } = await supabase
      .from('filmes_salvos')
      .insert([{ tmdb_id, titulo, poster }])
      .select()
      .single();

    filme = data;
  }

  res.json(filme);
});

/* =========================
   ASSISTIR DEPOIS
========================= */
router.post('/assistir-depois', authMiddleware, async (req, res) => {
  const { tmdb_id, titulo, poster } = req.body;
  const userId = req.user.id;

  const lista = await obterOuCriarLista('Assistir depois', userId);

  const { data: filme } = await supabase
    .from('filmes_salvos')
    .upsert([{ tmdb_id, titulo, poster }])
    .select()
    .single();

  await supabase
    .from('lista_filmes')
    .upsert(
      [{ lista_id: lista.id, filme_id: filme.id }],
      { onConflict: 'lista_id,filme_id' }
    );

  res.status(201).send();
});

router.delete('/assistir-depois/:tmdbId', authMiddleware, async (req, res) => {
  const { tmdbId } = req.params;
  const userId = req.user.id;

  const lista = await obterOuCriarLista('Assistir depois', userId);

  const { data: filme } = await supabase
    .from('filmes_salvos')
    .select('id')
    .eq('tmdb_id', tmdbId)
    .single();

  if (filme) {
    await supabase
      .from('lista_filmes')
      .delete()
      .eq('lista_id', lista.id)
      .eq('filme_id', filme.id);
  }

  res.status(204).send();
});

/* =========================
   JÁ ASSISTIDOS
========================= */
router.post('/ja-assistidos', authMiddleware, async (req, res) => {
  const { tmdb_id, titulo, poster } = req.body;
  const userId = req.user.id;

  const lista = await obterOuCriarLista('Já assistidos', userId);

  const { data: filme } = await supabase
    .from('filmes_salvos')
    .upsert([{ tmdb_id, titulo, poster }])
    .select()
    .single();

  await supabase
    .from('lista_filmes')
    .upsert(
      [{ lista_id: lista.id, filme_id: filme.id }],
      { onConflict: 'lista_id,filme_id' }
    );

  res.status(201).send();
});

router.delete('/ja-assistidos/:tmdbId', authMiddleware, async (req, res) => {
  const { tmdbId } = req.params;
  const userId = req.user.id;

  const lista = await obterOuCriarLista('Já assistidos', userId);

  const { data: filme } = await supabase
    .from('filmes_salvos')
    .select('id')
    .eq('tmdb_id', tmdbId)
    .single();

  if (filme) {
    await supabase
      .from('lista_filmes')
      .delete()
      .eq('lista_id', lista.id)
      .eq('filme_id', filme.id);
  }

  res.status(204).send();
});

module.exports = router;

