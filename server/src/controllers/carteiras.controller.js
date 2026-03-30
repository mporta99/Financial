const { prisma } = require("../lib/prisma");

async function listCarteiras() {
  const items = await prisma.carteira.findMany({
    orderBy: {
      id: "asc"
    }
  });

  return { items };
}

module.exports = { listCarteiras };
