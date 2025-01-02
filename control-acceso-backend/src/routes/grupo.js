const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupoController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Rutas CRUD para grupos
router.post('/', authMiddleware, grupoController.crearGrupo);  // Solo autenticados
router.get('/', authMiddleware, grupoController.obtenerGrupos);  // Admin solo ve sus grupos
router.get('/:id', authMiddleware, grupoController.obtenerGrupoPorId);
router.delete('/:id', authMiddleware, roleMiddleware(['super_admin']), grupoController.eliminarGrupo);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'super_admin']), grupoController.actualizarGrupo);


module.exports = router;
