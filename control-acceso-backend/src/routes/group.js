const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/groupController');
const subgrupoController = require('../controllers/subGroupController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// ------------------------
//        GRUPOS
// ------------------------

// Crear un grupo 
router.post('/grupos', authMiddleware, grupoController.createGroup);

// Actualizar un grupo (solo admin)
router.put('/grupos/:groupId', authMiddleware, roleMiddleware(['admin']), grupoController.updateGroup);

// Eliminar un grupo (solo admin)
router.delete('/grupos/:groupId', authMiddleware, roleMiddleware(['admin']), grupoController.deleteGroup);

// ------------------------
//      SUBGRUPOS
// ------------------------

// Crear un subgrupo (solo colaborador o admin)
router.post(
  '/grupos/:groupId/subgrupos',
  authMiddleware,
  roleMiddleware(['admin', 'colaborador']),
  subgrupoController.createSubgroup
);

// Obtener todos los subgrupos de un grupo específico
router.get(
  '/grupos/:groupId/subgrupos',
  authMiddleware,
  subgrupoController.getSubgroupsByGroup
);

// Actualizar un subgrupo (solo colaborador o admin)
router.put(
  '/grupos/:groupId/subgrupos/:subgroupId',
  authMiddleware,
  roleMiddleware(['admin', 'colaborador']),
  subgrupoController.updateSubgroup
);

// Eliminar un subgrupo (solo colaborador o admin)
router.delete(
  '/grupos/:groupId/subgrupos/:subgroupId',
  authMiddleware,
  roleMiddleware(['admin', 'colaborador']),
  subgrupoController.deleteSubgroup
);

module.exports = router;
