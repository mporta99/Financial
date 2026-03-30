const { prisma } = require("../lib/prisma");
const { requireInteger } = require("../utils/validators");

async function listCategoriasSubcontas() {
  const items = await prisma.categoriaSubconta.findMany({
    include: {
      categoria: true,
      subconta: {
        include: {
          carteira: true
        }
      }
    },
    orderBy: {
      id: "asc"
    }
  });

  return { items };
}

async function createCategoriaSubconta(payload) {
  const item = await prisma.categoriaSubconta.create({
    data: {
      categoria_id: requireInteger(payload.categoria_id, "categoria_id"),
      subconta_id: requireInteger(payload.subconta_id, "subconta_id")
    },
    include: {
      categoria: true,
      subconta: {
        include: {
          carteira: true
        }
      }
    }
  });

  return { item };
}

module.exports = { createCategoriaSubconta, listCategoriasSubcontas };
