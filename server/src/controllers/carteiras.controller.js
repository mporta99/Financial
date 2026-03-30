const { prisma } = require("../lib/prisma");
const { requireBoolean, requireIdParam, requireString } = require("../utils/validators");

async function listCarteiras() {
  const items = await prisma.carteira.findMany({
    orderBy: {
      id: "asc"
    }
  });

  return { items };
}

async function createCarteira(payload) {
  const item = await prisma.carteira.create({
    data: {
      nome: requireString(payload.nome, "nome"),
      tipo: requireString(payload.tipo, "tipo"),
      ativa: requireBoolean(payload.ativa, "ativa")
    }
  });

  return { item };
}

async function updateCarteira(id, payload) {
  const item = await prisma.carteira.update({
    where: {
      id: requireIdParam(id)
    },
    data: {
      nome: requireString(payload.nome, "nome"),
      tipo: requireString(payload.tipo, "tipo"),
      ativa: requireBoolean(payload.ativa, "ativa")
    }
  });

  return { item };
}

async function deleteCarteira(id) {
  await prisma.carteira.delete({
    where: {
      id: requireIdParam(id)
    }
  });

  return { success: true };
}

module.exports = { createCarteira, deleteCarteira, listCarteiras, updateCarteira };
