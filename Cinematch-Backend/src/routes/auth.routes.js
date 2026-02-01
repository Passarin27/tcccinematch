const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;

