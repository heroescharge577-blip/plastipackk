// backend/routes/references.js

const express = require('express');

const router = express.Router();

const {
  ensureAuth,
  ensureRoleAssigned
} = require('../middleware/auth');

const {
  requireRole
} = require('../middleware/roles');

const ctrl = require('../controllers/referenceController');


router.use(
  ensureAuth,
  ensureRoleAssigned
);


// 📋 Listar referencias
router.get(
  '/',
  requireRole('jefe'),
  ctrl.listar
);


// 📄 Datos para formulario
router.get(
  '/nueva',
  requireRole('jefe'),
  ctrl.formularioNueva
);


// 💾 Crear referencia
router.post(
  '/',
  requireRole('jefe'),
  ctrl.crear
);

// 🧾 Actualizar stock de referencia
router.put(
  '/:id/stock',
  requireRole('jefe'),
  ctrl.actualizarStock
);

// 🧾 Reporte de inventario
router.get(
  '/stock',
  requireRole('jefe'),
  ctrl.reporteStock
);

// 🏪 Vender desde inventario
router.post(
  '/:id/vender',
  requireRole('jefe'),
  ctrl.vender
);

module.exports = router;