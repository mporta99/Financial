const { prisma } = require("../lib/prisma");

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

module.exports = { listCategoriasSubcontas };
