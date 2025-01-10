const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupoController');
const subgrupoController = require('../controllers/subgrupoController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// ------------------------
//        GRUPOS
// ------------------------

// Crear grupo (solo usuarios autenticados)
router.post('/grupos', authMiddleware, grupoController.crearGrupo);

// Agregar usuario a un grupo (solo admin o colaborador)
router.post(
  '/grupos/:id/agregar-usuario',
  authMiddleware,
  roleMiddleware(['admin', 'colaborador']),
  grupoController.agregarUsuarioAGrupo
);

// Obtener todos los grupos del usuario autenticado
router.get('/grupos', authMiddleware, grupoController.obtenerGruposDelUsuario);

// Eliminar usuario de un grupo (solo admin)
router.delete(
  '/grupos/:id/eliminar-usuario',
  authMiddleware,
  roleMiddleware(['admin']),
  grupoController.eliminarUsuarioDeGrupo
);

// Eliminar grupo completo (solo admin)
router.delete(
  '/grupos/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  grupoController.eliminarGrupo
);

// Obtener logs de un grupo (admin o super_admin)
router.get(
  '/grupos/:id/logs',
  authMiddleware,
  roleMiddleware(['admin', 'super_admin']),
  grupoController.obtenerLogs
);


// Ruta para obtener detalles de un grupo por ID
router.get('/grupos/:id', authMiddleware, grupoController.obtenerDetalleGrupo);





// ------------------------
//      SUBGRUPOS
// ------------------------

// Crear subgrupo (solo colaborador o admin)
router.post(
  '/grupos/:grupoId/subgrupos',
  authMiddleware,
  roleMiddleware(['admin', 'colaborador']),
  subgrupoController.crearSubgrupo
);

// Eliminar subgrupo (admin o creador del subgrupo)
router.delete(
  '/grupos/:grupoId/subgrupos/:subgrupoId',
  authMiddleware,
  roleMiddleware(['admin', 'colaborador']),
  subgrupoController.eliminarSubgrupo
);

// Agregar usuario a subgrupo (admin o creador del subgrupo)
router.post(
  '/grupos/:grupoId/subgrupos/:subgrupoId/agregar-usuario',
  authMiddleware,
  roleMiddleware(['admin', 'colaborador']),
  subgrupoController.agregarUsuarioASubgrupo
);

module.exports = router;
