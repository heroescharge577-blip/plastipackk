// backend/middleware/roles.js

function requireRole(...rolesPermitidos) {
  return function (req, res, next) {
    console.log('requireRole check for', req.path, 'user:', req.user?.nombre, 'rol:', req.user?.rol, 'permitidos:', rolesPermitidos);

    // No autenticado
    if (!req.user) {
      console.log('requireRole: no user');
      return res.status(401).json({
        error: "Sesión requerida"
      });
    }

    const rol = req.user.rol;

    // Admin siempre puede
    if (rol === "admin" || rolesPermitidos.includes(rol)) {
      console.log('requireRole: access granted');
      return next();
    }

    // Sin permisos
    console.log('requireRole: access denied');
    return res.status(403).json({
      error: "Acceso denegado",
      mensaje: `Solo permitido para: ${rolesPermitidos.join(", ")}`,
      tuRol: rol
    });
  };
}

module.exports = { requireRole };