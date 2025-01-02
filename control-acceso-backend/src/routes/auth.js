const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');

// Rutas
router.get('/perfil', authMiddleware, authController.getPerfil);
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
