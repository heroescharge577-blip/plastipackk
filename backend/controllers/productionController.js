const Order = require('../models/Order');
const ProductionLog = require('../models/ProductionLog');

exports.dashboardOperario = async (req, res) => {
  try {

    const selladora =
      Number(req.query.selladora) ||
      req.user.selladoraDefault ||
      1;

    const ordenes = await Order.find({
      'items.estado': 'en_produccion'
    })
      .populate(
        'items.referencia',
        'sku nombre tipo'
      )
      .sort('fechaEntrega');

    const itemsDisponibles = [];

    for (const o of ordenes) {

      for (const it of o.items) {

        if (it.estado !== 'en_produccion')
          continue;

        const pendiente = Math.max(
          0,
          it.cantidad - (it.producido || 0)
        );

        if (pendiente <= 0)
          continue;

        itemsDisponibles.push({
          ordenId: o._id,
          ordenNumero: o.numero,
          itemId: it._id,
          referencia: it.referencia,
          cantidad: it.cantidad,
          producido: it.producido || 0,
          pendiente,
          fechaEntrega: o.fechaEntrega
        });
      }
    }

    const inicioDia = new Date();

    inicioDia.setHours(0, 0, 0, 0);

    const misLogs = await ProductionLog.find({
      operario: req.user._id,
      horaInicio: { $gte: inicioDia }
    })
      .populate('referencia', 'sku nombre')
      .populate('orden', 'numero')
      .sort('-horaInicio');

    res.json({
      selladora,
      selladoras: [1, 2, 3, 4, 5],
      itemsDisponibles,
      misLogs
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

exports.registrarTurno = async (req, res) => {

  try {

    const {
      selladora,
      ordenId,
      itemId,
      numeroRollo,
      horaInicio,
      horaFin,
      cantidadProducida,
      desperdicio,
      observaciones
    } = req.body;

    const orden = await Order.findById(
      ordenId
    );

    if (!orden) {

      return res.status(404).json({
        message: 'Pedido no encontrado'
      });

    }

    const item = orden.items.id(itemId);

    if (!item) {

      return res.status(404).json({
        message:
          'Item de pedido no encontrado'
      });

    }

    if (
      item.estado === 'completado' ||
      item.estado === 'entregado'
    ) {

      return res.status(400).json({
        message:
          'Esta referencia ya fue completada'
      });

    }

    const log = await ProductionLog.create({

      operario: req.user._id,

      selladora: Number(selladora),

      orden: orden._id,

      orderItemId: item._id,

      referencia: item.referencia,

      numeroRollo,

      horaInicio: new Date(horaInicio),

      horaFin: new Date(horaFin),

      cantidadProducida:
        Number(cantidadProducida),

      desperdicio_kg:
        Number(desperdicio || 0),

      observaciones
    });

    item.producido =
      (item.producido || 0) +
      Number(cantidadProducida);

    if (item.producido >= item.cantidad) {

      item.estado = 'completado';

      item.producido = item.cantidad;
    }

    orden.recalcularEstadoGeneral();

    await orden.save();

    if (
      req.user.selladoraDefault !==
      Number(selladora)
    ) {

      req.user.selladoraDefault =
        Number(selladora);

      await req.user.save();
    }

    res.status(201).json({
      message: 'Turno registrado',
      log
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};


// 📋 Cambiar etapa de un item del pedido
exports.cambiarEtapa = async (req, res) => {
  try {
    const { ordenId, itemId, etapa } = req.body;

    if (!['extrusion', 'impresion', 'sellado'].includes(etapa)) {
      return res.status(400).json({ message: 'Etapa inválida' });
    }

    const orden = await require('../models/Order').findById(ordenId);
    if (!orden) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const item = orden.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item no encontrado' });
    }

    item.etapaActual = etapa;
    if (!item.etapas) {
      item.etapas = { extrusion: {}, impresion: {}, sellado: {} };
    }
    if (!item.etapas[etapa]) {
      item.etapas[etapa] = {};
    }
    item.etapas[etapa].fechaInicio = new Date();

    await orden.save();

    res.json({ message: 'Etapa actualizada', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Completar etapa
exports.completarEtapa = async (req, res) => {
  try {
    const { ordenId, itemId } = req.body;

    const orden = await require('../models/Order').findById(ordenId);
    if (!orden) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const item = orden.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item no encontrado' });
    }

    const etapaActual = item.etapaActual;
    if (!item.etapas[etapaActual]) {
      item.etapas[etapaActual] = {};
    }

    item.etapas[etapaActual].completada = true;
    item.etapas[etapaActual].fechaFin = new Date();

    const ETAPAS_ORD = ['extrusion', 'impresion', 'sellado'];
    const idxActual = ETAPAS_ORD.indexOf(etapaActual);
    if (idxActual < ETAPAS_ORD.length - 1) {
      item.etapaActual = ETAPAS_ORD[idxActual + 1];
    } else {
      item.etapaActual = 'completado';
      item.estado = 'completado';
    }

    await orden.save();

    res.json({ message: 'Etapa completada', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};