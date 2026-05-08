// backend/controllers/authController.js

exports.getSession = (req, res) => {
  if (!req.isAuthenticated()) {
    return res.json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    user: req.user
  });
};

exports.logout = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);

    res.json({
      message: "Sesión cerrada"
    });
  });
};

exports.sinRol = (req, res) => {
  res.status(403).json({
    message: "Cuenta pendiente de rol"
  });
};