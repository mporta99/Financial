const { prisma } = require("../lib/prisma");

async function listCategorias() {
  const items = await prisma.categoria.findMany({
    orderBy: [
      { tipo: "asc" },
      { id: "asc" }
    ]
  });

  return { items };
}

module.exports = { listCategorias };
