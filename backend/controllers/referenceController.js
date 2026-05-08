// backend/controllers/referenceController.js

const Reference = require('../models/Reference');


// 📋 Listar referencias
exports.listar = async (req, res, next) => {
  try {

    const q = (req.query.q || '').trim();

    const filtro = { activo: true };

    if (q) {
      const regex = new RegExp(
        q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
      );

      filtro.$or = [
        { sku: regex },
        { nombre: regex },
        { materiaPrima: regex }
      ];
    }

    const referencias = await Reference.find(filtro)
      .sort('-createdAt')
      .limit(100);

    res.json(referencias);

  } catch (err) {
    next(err);
  }
};


// ➕ Datos del formulario
exports.formularioNueva = async (req, res) => {

  res.json({
    tipos: Reference.TIPOS,
    destinos: Reference.DESTINOS
  });

};


// 💾 Crear referencia
exports.crear = async (req, res, next) => {

  try {

    const b = req.body;

    const referencia = await Reference.create({

      sku: b.sku,
      nombre: b.nombre,
      tipo: b.tipo,

      materiaPrima: b.materiaPrima,

      dimensiones: {
        ancho_cm: b.ancho_cm || undefined,
        alto_cm: b.alto_cm || undefined,
        largo_m: b.largo_m || undefined,
        calibre_mic: b.calibre_mic || undefined,
        fuelle_cm: b.fuelle_cm || undefined,
      },

      impresion: {
        lleva: b.lleva_impresion,
        logo: b.logo,
        colores: Number(b.colores || 0),
      },

      destino: b.destino,

      procesos: {
        extrusion: true,
        impresionRefilado: b.impresionRefilado,
        sellado: b.sellado,
      },

      pesoUnitario_g: b.pesoUnitario_g,
      stockDisponible: Number(b.stockDisponible || 0),
      stockMinimo: Number(b.stockMinimo || 0),

      notas: b.notas,

      creadoPor: req.user._id

    });

    res.status(201).json(referencia);

  } catch (err) {

    if (err.code === 11000) {
      return res.status(400).json({
        error: 'El SKU ya existe'
      });
    }

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: Object.values(err.errors)
          .map(e => e.message)
          .join(' · ')
      });
    }

    next(err);
  }
};


// 🧾 Actualizar stock de referencia
exports.actualizarStock = async (req, res, next) => {
  try {
    const referencia = await Reference.findById(req.params.id);
    if (!referencia) {
      return res.status(404).json({ message: 'Referencia no encontrada' });
    }

    referencia.stockDisponible = Number(req.body.stockDisponible ?? referencia.stockDisponible);
    referencia.stockMinimo = Number(req.body.stockMinimo ?? referencia.stockMinimo);

    await referencia.save();

    res.json(referencia);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(' · ') });
    }
    next(err);
  }
};


// 🧾 Reporte de inventario
exports.reporteStock = async (req, res, next) => {
  try {
    const lowOnly = req.query.lowOnly === 'true';

    const referencias = await Reference.find({ activo: true })
      .sort('-createdAt')
      .limit(500);

    const resultado = referencias.map((ref) => ({
      _id: ref._id,
      sku: ref.sku,
      nombre: ref.nombre,
      destino: ref.destino,
      stockDisponible: ref.stockDisponible,
      stockMinimo: ref.stockMinimo,
      lowStock:
        ref.stockMinimo >= 0 &&
        ref.stockDisponible <= ref.stockMinimo,
    }));

    res.json(lowOnly ? resultado.filter((ref) => ref.lowStock) : resultado);
  } catch (err) {
    next(err);
  }
};


// 🏪 Vender desde inventario
exports.vender = async (req, res, next) => {
  try {
    const cantidad = Number(req.body.cantidad || 0);
    if (cantidad <= 0) {
      return res.status(400).json({ message: 'La cantidad debe ser mayor que cero' });
    }

    const referencia = await Reference.findById(req.params.id);
    if (!referencia) {
      return res.status(404).json({ message: 'Referencia no encontrada' });
    }

    if (referencia.stockDisponible < cantidad) {
      return res.status(400).json({ message: 'No hay stock suficiente' });
    }

    referencia.stockDisponible -= cantidad;
    await referencia.save();

    res.json({ message: 'Venta registrada', referencia });
  } catch (err) {
    next(err);
  }
};