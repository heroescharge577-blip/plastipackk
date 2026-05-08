require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash = require('connect-flash');
const methodOverride = require('method-override');
const cors = require('cors');

const connectDB = require('./config/db');
const passport = require('./config/passport');

// ============================================
// Inicialización
// ============================================
const app = express();

// IMPORTANTE para Codespaces / proxies
app.set('trust proxy', 1);

// Conectar MongoDB
connectDB();

// ============================================
// Middlewares
// ============================================
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// Sesiones
// ============================================
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'cambia-esto',

    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 14 * 24 * 60 * 60, // 14 días
    }),

    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure:
        process.env.NODE_ENV === 'production' ||
        process.env.FORCE_SECURE === 'true' ||
        (process.env.CLIENT_URL || '').startsWith('https:'),
      sameSite: (process.env.CLIENT_URL || '').startsWith('https:')
        ? 'none'
        : 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.app.github.dev' : undefined,
    },
  })
);

// ============================================
// Passport
// ============================================
app.use(passport.initialize());
app.use(passport.session());

// ============================================
// Flash messages
// ============================================
app.use(flash());

// ============================================
// Middleware global
// ============================================
app.use((req, res, next) => {
  req.successMessages = req.flash('success');
  req.errorMessages = req.flash('error');

  next();
});

// ============================================
// Ruta API base
// ============================================
app.get('/api', (req, res) => {
  res.json({
    ok: true,
    message: 'API Plastipack funcionando 🚀',
  });
});

// ============================================
// Rutas API
// ============================================
app.use('/api/auth', require('./routes/auth'));

app.use('/api/pedidos', require('./routes/orders'));

app.use('/api/referencias', require('./routes/references'));

app.use('/api/operario', require('./routes/production'));

app.use('/api', require('./routes/reports'));

// ============================================
// Usuario autenticado
// ============================================
app.get('/api/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      ok: false,
      message: 'No autenticado',
    });
  }

  res.json({
    ok: true,
    user: req.user,
  });
});

// ============================================
// Usuario sin rol
// ============================================
app.get('/api/sin-rol', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      ok: false,
      message: 'Debes iniciar sesión',
    });
  }

  res.json({
    ok: true,
    message:
      'Tu cuenta está pendiente de asignación de rol.',
  });
});

// ============================================
// 404
// ============================================
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada',
  });
});

// ============================================
// Manejo de errores
// ============================================
app.use((err, req, res, next) => {
  console.error('💥', err);

  res.status(500).json({
    ok: false,

    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Ocurrió un error inesperado.',
  });
});

// ============================================
// Producción React
// ============================================
if (process.env.NODE_ENV === 'production') {
  app.use(
    express.static(
      path.join(__dirname, '../frontend/dist')
    )
  );

  app.get('*', (req, res) => {
    res.sendFile(
      path.resolve(
        __dirname,
        '../frontend/dist/index.html'
      )
    );
  });
}

// ============================================
// Servidor
// ============================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `🚀 Plastipack API corriendo en http://localhost:${PORT}`
  );
});