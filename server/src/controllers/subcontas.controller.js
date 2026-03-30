const { prisma } = require("../lib/prisma");

async function listSubcontas() {
  const items = await prisma.subconta.findMany({
    include: {
      carteira: true
    },
    orderBy: [
      { carteira_id: "asc" },
      { id: "asc" }
    ]
  });

  return { items };
}

module.exports = { listSubcontas };
