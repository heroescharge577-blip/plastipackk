// backend/middleware/auth.js

function ensureAuth(req, res, next) {
  console.log('ensureAuth for', req.path, 'isAuthenticated:', req.isAuthenticated ? req.isAuthenticated() : 'no method');
  if (req.isAuthenticated && req.isAuthenticated()) return next();

  return res.status(401).json({
    error: "No autenticado"
  });
}

function ensureRoleAssigned(req, res, next) {
  console.log('ensureRoleAssigned for', req.path, 'user rol:', req.user?.rol);
  if (req.user && req.user.rol && req.user.rol !== 'pendiente') return next();

  return res.status(403).json({
    error: "Usuario sin rol asignado"
  });
}

module.exports = { ensureAuth, ensureRoleAssigned };