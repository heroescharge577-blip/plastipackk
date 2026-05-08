const express = require('express');
const passport = require('passport');

const router = express.Router();

// =============================
// LOGIN GOOGLE
// =============================
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// =============================
// CALLBACK GOOGLE
// =============================
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),

  (req, res) => {
    // ✅ Redirigir al frontend React
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

// =============================
// SESIÓN ACTUAL
// =============================
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.json({
      authenticated: false,
    });
  }

  res.json({
    authenticated: true,
    user: req.user,
  });
});

// =============================
// LOGOUT
// =============================
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({
      message: 'Logout exitoso',
    });
  });
});

module.exports = router;