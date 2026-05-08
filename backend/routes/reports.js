// backend/routes/reports.js

const express = require("express");

const router = express.Router();

const ctrl = require("../controllers/reportController");

const {
  ensureAuth,
  ensureRoleAssigned,
} = require("../middleware/auth");

const {
  requireRole,
} = require("../middleware/roles");

router.use(
  ensureAuth,
  ensureRoleAssigned
);

router.get(
  "/reportes",
  requireRole("jefe", "admin"),
  ctrl.reporteProduccion
);

router.get(
  "/ordenes",
  requireRole("jefe"),
  ctrl.ordenesActivas
);

router.get(
  "/admin/usuarios",
  requireRole("jefe", "admin"),
  ctrl.usuariosPendientes
);

router.put(
  "/admin/usuarios/:id/rol",
  requireRole("jefe", "admin"),
  ctrl.asignarRol
);

module.exports = router;