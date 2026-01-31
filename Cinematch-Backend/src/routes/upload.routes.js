const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middlewares/auth.middleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

/* =========================
   POST /upload/avatar
========================= */
router.post(
    '/avatar',
    authMiddleware,
    upload.single('file'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Arquivo não enviado' });
            }

            const fileExt = req.file.originalname.split('.').pop();
            const fileName = `${req.user.id}.${fileExt}`;

            const { error } = await supabase.storage
                .from('Avatares')
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: true
                });

            if (error) {
                return res.status(400).json({ error: error.message });
            }

            const { data } = supabase.storage
                .from('Avatares')
                .getPublicUrl(fileName);

            // salva no banco
            await supabase
                .from('usuarios')
                .update({ foto: data.publicUrl })
                .eq('id', req.user.id);

            res.json({ foto: data.publicUrl });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

module.exports = router;
