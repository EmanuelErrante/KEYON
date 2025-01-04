const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const userLogController = require('../controllers/userLogController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Obtener todos los usuarios (solo super_admin)
router.get(
    '/',
    authMiddleware,
    roleMiddleware(['super_admin']),
    userController.getAllUsers
);

// Crear un nuevo usuario (solo admin o super_admin)
router.post(
    '/',
    authMiddleware,
    roleMiddleware(['admin', 'super_admin']),
    userController.createUser
);

// Eliminar un usuario (solo super_admin)
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware(['super_admin']),
    userController.deleteUser
);

// Actualizar rol de usuario en grupo (admin del grupo o super_admin)
router.put(
    '/:id/roles',
    authMiddleware,
    userController.updateUserRole
);

// Obtener logs de un usuario específico (solo super_admin)
router.get(
    '/:id/logs',
    authMiddleware,
    roleMiddleware(['super_admin']),
    userLogController.obtenerLogsPorUsuario
);

// Obtener todos los logs (solo super_admin)
router.get(
    '/logs',
    authMiddleware,
    roleMiddleware(['super_admin']),
    userLogController.obtenerTodosLosLogs
);

module.exports = router;
