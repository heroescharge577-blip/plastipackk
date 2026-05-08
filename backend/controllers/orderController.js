const Order = require('../models/Order');
const Reference = require('../models/Reference');

exports.listarPedidos = async (req, res) => {
  try {
    const filtro =
      ['admin', 'jefe'].includes(req.user.rol)
        ? {}
        : { vendedor: req.user._id };

    const pedidos = await Order.find(filtro)
      .populate('vendedor', 'nombre email')
      .populate('items.referencia', 'sku nombre tipo')
      .sort('-createdAt');

    res.json(pedidos);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.buscarReferencias = async (req, res) => {
  try {

    const q = (req.query.q || '').trim();

    if (q.length < 2) {
      return res.json([]);
    }

    const regex = new RegExp(q, 'i');

    const refs = await Reference.find({
      activo: true,
      $or: [
        { sku: regex },
        { nombre: regex }
      ]
    })
      .limit(20);

    res.json(refs);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.crearPedido = async (req, res) => {
  try {

    const {
      clienteNombre,
      clienteContacto,
      destino,
      fechaEntrega,
      notas,
      items
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'El pedido debe incluir al menos una referencia.' });
    }

    const cantidadesPorReferencia = items.reduce((acc, item) => {
      const refId = String(item.referencia);
      acc[refId] = (acc[refId] || 0) + Number(item.cantidad || 0);
      return acc;
    }, {});

    const referencias = await Reference.find({
      _id: { $in: Object.keys(cantidadesPorReferencia) }
    });

    if (referencias.length !== Object.keys(cantidadesPorReferencia).length) {
      return res.status(400).json({
        message: 'Algunas referencias del pedido no existen o no están disponibles.',
      });
    }

    const faltantes = referencias
      .map((ref) => ({
        referencia: ref.sku,
        stockDisponible: ref.stockDisponible,
        cantidadSolicitada: cantidadesPorReferencia[String(ref._id)]
      }))
      .filter((entry) => entry.cantidadSolicitada > entry.stockDisponible);

    if (faltantes.length) {
      return res.status(400).json({
        message: 'No hay stock suficiente para algunas referencias.',
        faltantes,
      });
    }

    const pedido = await Order.create({
      vendedor: req.user._id,
      cliente: {
        nombre: clienteNombre,
        contacto: clienteContacto
      },
      destino,
      fechaEntrega,
      notas,
      items: items.map(item => ({
        ...item,
        estado: 'en_produccion'
      }))
    });

    await Promise.all(
      referencias.map((ref) => {
        const cantidad = cantidadesPorReferencia[String(ref._id)];
        return Reference.updateOne(
          { _id: ref._id },
          { $inc: { stockDisponible: -cantidad } }
        );
      })
    );

    res.status(201).json({
      message: 'Pedido creado',
      pedido
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.verPedido = async (req, res) => {
  try {

    const pedido = await Order.findById(req.params.id)
      .populate('vendedor', 'nombre')
      .populate('items.referencia');

    if (!pedido) {
      return res.status(404).json({
        message: 'Pedido no encontrado'
      });
    }

    res.json(pedido);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.cambiarEstadoItem = async (req, res) => {
  try {

    const { id, itemId } = req.params;
    const { estado } = req.body;

    const pedido = await Order.findById(id);

    const item = pedido.items.id(itemId);

    item.estado = estado;

    pedido.recalcularEstadoGeneral();

    await pedido.save();

    res.json({
      message: 'Estado actualizado'
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};