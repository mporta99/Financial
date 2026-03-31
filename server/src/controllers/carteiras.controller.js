const { prisma } = require("../lib/prisma");
const { HttpError } = require("../utils/http-error");
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
  const carteiraId = requireIdParam(id);
  const subcontasCount = await prisma.subconta.count({
    where: {
      carteira_id: carteiraId
    }
  });

  if (subcontasCount > 0) {
    throw new HttpError(409, "Nao e possivel excluir esta carteira porque existem subcontas vinculadas a ela.");
  }

  await prisma.carteira.delete({
    where: {
      id: carteiraId
    }
  });

  return { success: true };
}

module.exports = { createCarteira, deleteCarteira, listCarteiras, updateCarteira };
