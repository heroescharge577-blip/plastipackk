require("dotenv").config();

const mongoose = require("mongoose");

const Reference = require("./models/Reference");
const Order = require("./models/Order");
const User = require("./models/User");

const REFS = [
  {
    sku: "BOL-PEBD-30X40-NAT",
    nombre:
      "Bolsa polietileno baja densidad 30x40 natural",

    tipo: "bolsa",

    materiaPrima: "PEBD virgen",

    destino: "externo",

    dimensiones: {
      ancho_cm: 30,
      alto_cm: 40,
      calibre_mic: 50,
    },

    impresion: {
      lleva: false,
      colores: 0,
    },

    procesos: {
      extrusion: true,
      impresionRefilado: false,
      sellado: true,
    },
  },

  {
    sku: "BOL-PEAD-25X35-LOGO",

    nombre:
      "Bolsa polietileno alta densidad 25x35 con logo",

    tipo: "bolsa",

    materiaPrima: "PEAD virgen",

    destino: "externo",

    dimensiones: {
      ancho_cm: 25,
      alto_cm: 35,
      calibre_mic: 40,
    },

    impresion: {
      lleva: true,
      logo: "Cliente XYZ - logo principal",
      colores: 2,
    },

    procesos: {
      extrusion: true,
      impresionRefilado: true,
      sellado: true,
    },
  },

  {
    sku: "ROL-PEBD-1.20-NAT",

    nombre:
      "Rollo polietileno baja densidad 1.20m natural",

    tipo: "rollo",

    materiaPrima: "PEBD virgen",

    destino: "interno",

    dimensiones: {
      ancho_cm: 120,
      largo_m: 500,
      calibre_mic: 80,
    },

    impresion: {
      lleva: false,
      colores: 0,
    },

    procesos: {
      extrusion: true,
      impresionRefilado: false,
      sellado: false,
    },
  },
];

async function runSeed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Mongo conectado");

    // CREAR REFERENCIAS
    for (const ref of REFS) {
      const existe = await Reference.findOne({
        sku: ref.sku,
      });

      if (!existe) {
        await Reference.create(ref);

        console.log("➕ Referencia creada:", ref.sku);
      } else {
        console.log("⚠ Ya existe:", ref.sku);
      }
    }

    // BUSCAR VENDEDOR
    const vendedor = await User.findOne({
      rol: "vendedor",
    });

    if (!vendedor) {
      console.log(
        "⚠ No existe vendedor aún"
      );

      process.exit(0);
    }

    // CREAR PEDIDO DEMO
    const totalPedidos =
      await Order.countDocuments();

    if (totalPedidos === 0) {
      const refs =
        await Reference.find().limit(3);

      const fechaEntrega = new Date();

      fechaEntrega.setDate(
        fechaEntrega.getDate() + 20
      );

      await Order.create({
        vendedor: vendedor._id,

        cliente: {
          nombre: "Cliente Demo SAS",
          contacto: "demo@cliente.com",
        },

        destino: "externo",

        items: refs.map((r) => ({
          referencia: r._id,
          cantidad: 5000,
          valorUnitario: 350,
          estado: "en_produccion",
        })),

        fechaEntrega,

        notas:
          "Pedido demo generado automáticamente",
      });

      console.log(
        "✅ Pedido demo creado"
      );
    } else {
      console.log(
        "⚠ Ya existen pedidos"
      );
    }

    console.log("🌱 Seed finalizado");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seed:", err);

    process.exit(1);
  }
}

runSeed();