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
   STATUS DO FILME
========================= */
router.get('/status/:tmdbId', authMiddleware, async (req, res) => {
  try {
    const { tmdbId } = req.params;
    const userId = req.user.id;

    const { data: filme } = await supabase
      .from('filmes_salvos')
      .select('id')
      .eq('tmdb_id', tmdbId)
      .eq('usuario_id', userId)
      .single();

    if (!filme) {
      return res.json({ assistirDepois: false, jaAssistido: false });
    }

    const { data: listas = [] } = await supabase
      .from('lista_filmes')
      .select(`listas!inner ( nome )`)
      .eq('filme_id', filme.id);

    const nomes = listas.map(l => l.listas.nome);

    res.json({
      assistirDepois: nomes.includes('Assistir depois'),
      jaAssistido: nomes.includes('Já assistidos')
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro status filme' });
  }
});

/* =========================
   ASSISTIR DEPOIS
========================= */
router.post('/assistir-depois', authMiddleware, async (req, res) => {
  try {
    const { tmdb_id, titulo, poster } = req.body;
    const userId = req.user.id;

    if (!tmdb_id) return res.sendStatus(400);

    const listaAssistirDepois = await obterOuCriarLista('Assistir depois', userId);
    const listaJaAssistidos = await obterOuCriarLista('Já assistidos', userId);

    const { data: filme, error } = await supabase
      .from('filmes_salvos')
      .upsert(
        [{ tmdb_id, titulo, poster, usuario_id: userId }],
        { onConflict: 'tmdb_id,usuario_id' }
      )
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.sendStatus(500);
    }

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

    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

/* =========================
   JÁ ASSISTIDOS
========================= */
router.post('/ja-assistidos', authMiddleware, async (req, res) => {
  try {
    const { tmdb_id, titulo, poster } = req.body;
    const userId = req.user.id;

    if (!tmdb_id) return res.sendStatus(400);

    const listaJaAssistidos = await obterOuCriarLista('Já assistidos', userId);
    const listaAssistirDepois = await obterOuCriarLista('Assistir depois', userId);

    const { data: filme, error } = await supabase
      .from('filmes_salvos')
      .upsert(
        [{ tmdb_id, titulo, poster, usuario_id: userId }],
        { onConflict: 'tmdb_id,usuario_id' }
      )
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.sendStatus(500);
    }

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

    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

module.exports = router;
