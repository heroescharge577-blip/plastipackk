const express = require('express');

const router = express.Router();

const {
  ensureAuth,
  ensureRoleAssigned
} = require('../middleware/auth');

const {
  requireRole
} = require('../middleware/roles');

const ctrl = require(
  '../controllers/productionController'
);

router.use(
  ensureAuth,
  ensureRoleAssigned
);

router.get(
  '/',
  requireRole('operario'),
  ctrl.dashboardOperario
);

router.post(
  '/turno',
  requireRole('operario'),
  ctrl.registrarTurno
);

router.post(
  '/etapa/cambiar',
  requireRole('jefe', 'operario'),
  ctrl.cambiarEtapa
);

router.post(
  '/etapa/completar',
  requireRole('jefe', 'operario'),
  ctrl.completarEtapa
);

module.exports = router;