const { prisma } = require("../lib/prisma");

async function listLancamentos() {
  const items = await prisma.lancamento.findMany({
    include: {
      categoria: true,
      subconta: {
        include: {
          carteira: true
        }
      }
    },
    orderBy: [
      { data: "desc" },
      { id: "desc" }
    ]
  });

  return { items };
}

module.exports = { listLancamentos };
