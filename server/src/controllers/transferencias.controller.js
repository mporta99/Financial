const { prisma } = require("../lib/prisma");

async function listTransferencias() {
  const items = await prisma.transferencia.findMany({
    include: {
      subconta_origem: {
        include: {
          carteira: true
        }
      },
      subconta_destino: {
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

module.exports = { listTransferencias };
