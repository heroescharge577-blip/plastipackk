// backend/controllers/reportController.js

const ProductionLog = require("../models/ProductionLog");
const Order = require("../models/Order");
const User = require("../models/User");

exports.reporteProduccion = async (req, res) => {
  console.log('reporteProduccion called by user:', req.user?.nombre, 'rol:', req.user?.rol);
  try {
    console.log('Building date filters...');
    const desde = req.query.desde
      ? new Date(req.query.desde)
      : new Date(new Date().setDate(new Date().getDate() - 7));

    const hasta = req.query.hasta
      ? new Date(req.query.hasta + "T23:59:59")
      : new Date();

    console.log('Date range:', desde, 'to', hasta);

    const matchPeriodo = {
      horaInicio: {
        $gte: desde,
        $lte: hasta,
      },
    };

    console.log('Starting aggregation for selladoras...');
    // ==========================
    // POR SELLADORA
    // ==========================

    const porSelladora = await ProductionLog.aggregate([
      { $match: matchPeriodo },

      {
        $group: {
          _id: "$selladora",
          turnos: { $sum: 1 },
          producido: { $sum: "$cantidadProducida" },
          desperdicio: { $sum: "$desperdicio_kg" },
        },
      },

      {
        $sort: { _id: 1 },
      },
    ]);

    console.log('Selladora aggregation result:', porSelladora);

    // ==========================
    // POR OPERARIO
    // ==========================

    const porOperario = await ProductionLog.aggregate([
      { $match: matchPeriodo },

      {
        $group: {
          _id: "$operario",
          turnos: { $sum: 1 },
          producido: { $sum: "$cantidadProducida" },
          desperdicio: { $sum: "$desperdicio_kg" },
        },
      },

      {
        $sort: { producido: -1 },
      },
    ]);

    const operariosIds = porOperario.map((o) => o._id);

    const operarios = await User.find({
      _id: { $in: operariosIds },
    }).select("nombre email");

    const mapa = Object.fromEntries(
      operarios.map((u) => [u._id.toString(), u])
    );

    const filasOperarios = porOperario.map((p) => ({
      ...p,
      nombre: mapa[p._id.toString()]?.nombre || "Desconocido",
      email: mapa[p._id.toString()]?.email || "",
    }));

    // ==========================
    // TOTALES
    // ==========================

    const totales = porSelladora.reduce(
      (acc, r) => ({
        turnos: acc.turnos + r.turnos,
        producido: acc.producido + r.producido,
        desperdicio: acc.desperdicio + r.desperdicio,
      }),
      {
        turnos: 0,
        producido: 0,
        desperdicio: 0,
      }
    );

    // ==========================
    // ULTIMOS LOGS
    // ==========================

    const ultimosLogs = await ProductionLog.find(matchPeriodo)
      .populate("operario", "nombre")
      .populate("referencia", "sku nombre")
      .populate("orden", "numero")
      .sort("-horaInicio")
      .limit(30)
      .lean();

    res.json({
      desde,
      hasta,
      porSelladora,
      filasOperarios,
      totales,
      ultimosLogs,
    });

  } catch (error) {
    console.error("Error reporteProduccion:", error);

    res.status(500).json({
      message: "Error cargando reportes",
      error: error.message,
    });
  }
};



// ==============================
// ORDENES ACTIVAS
// ==============================

exports.ordenesActivas = async (req, res) => {
  try {

    const ordenes = await Order.find({
      estadoGeneral: { $ne: "entregado" },
    })
      .populate("vendedor", "nombre")
      .populate("items.referencia", "sku nombre")
      .sort("fechaEntrega");

    res.json(ordenes);

  } catch (error) {

    res.status(500).json({
      message: "Error cargando órdenes",
    });

  }
};



// ==============================
// USUARIOS PENDIENTES
// ==============================

exports.usuariosPendientes = async (req, res) => {
  try {

    const pendientes = await User.find({
      rol: "pendiente",
    });

    const todos = await User.find({});

    res.json({
      pendientes,
      todos,
      roles: [
        "admin",
        "jefe",
        "vendedor",
        "operario",
      ],
    });

  } catch (error) {

    res.status(500).json({
      message: "Error cargando usuarios",
    });

  }
};



// ==============================
// ASIGNAR ROL
// ==============================

exports.asignarRol = async (req, res) => {
  try {

    const { rol } = req.body;

    if (
      !["admin", "jefe", "vendedor", "operario"].includes(rol)
    ) {
      return res.status(400).json({
        message: "Rol inválido",
      });
    }

    await User.findByIdAndUpdate(req.params.id, {
      rol,
    });

    res.json({
      message: "Rol actualizado",
    });

  } catch (error) {

    res.status(500).json({
      message: "Error actualizando rol",
    });

  }
};