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

//agregar usuario a grupo
router.post(
  '/grupos/:groupId/usuarios',
  authMiddleware,
  roleMiddleware(['admin']),
  grupoController.addUserToGroup
);

//Eliminar Usuario de grupo
router.delete(
  '/grupos/:groupId/:userId',
  authMiddleware,
  roleMiddleware(['admin']),
  grupoController.removeUserFromGroup
);


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

// Agregar usuario a un subgrupo (solo admin del grupo padre o colaborador del subgrupo)
router.post(
  '/grupos/:groupId/subgrupos/:subgroupId/usuarios',
  authMiddleware,
  roleMiddleware(['admin', 'colaborador']),
  subgrupoController.addUserToSubgroup
);

// Eliminar usuario de un subgrupo (solo admin del grupo padre o colaborador del subgrupo)
router.delete(
  '/grupos/:groupId/subgrupos/:subgroupId/usuarios/:userId',
  authMiddleware,
  roleMiddleware(['admin', 'colaborador']),
  subgrupoController.removeUserFromSubgroup
);




module.exports = router;
