const express = require('express');
const router = express.Router();

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const userController = require('../controllers/userController');

// Obtener todos los usuarios (solo super_admin)
router.get('/', authMiddleware, roleMiddleware(['super_admin']), userController.getAllUsers);

// Crear un nuevo usuario (admin o super_admin)
router.post('/', authMiddleware, roleMiddleware(['admin', 'super_admin']), userController.createUser);

// Eliminar usuario (solo super_admin)
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin']), userController.deleteUser);

module.exports = router;
