const express = require('express');
const router = express.Router();

const {
  ensureAuth,
  ensureRoleAssigned
} = require('../middleware/auth');

const {
  requireRole
} = require('../middleware/roles');

const ctrl = require('../controllers/orderController');

router.use(ensureAuth, ensureRoleAssigned);

router.get(
  '/',
  requireRole('vendedor', 'jefe'),
  ctrl.listarPedidos
);

router.post(
  '/',
  requireRole('vendedor'),
  ctrl.crearPedido
);

router.get(
  '/api/referencias',
  requireRole('vendedor'),
  ctrl.buscarReferencias
);

router.get(
  '/:id',
  requireRole('vendedor', 'jefe'),
  ctrl.verPedido
);

router.put(
  '/:id/items/:itemId/estado',
  requireRole('jefe'),
  ctrl.cambiarEstadoItem
);

module.exports = router;