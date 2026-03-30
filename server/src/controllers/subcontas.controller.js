const { prisma } = require("../lib/prisma");
const {
  TIPOS_SUBCONTA,
  requireBoolean,
  requireEnum,
  requireIdParam,
  requireInteger,
  requireString
} = require("../utils/validators");

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

async function createSubconta(payload) {
  const item = await prisma.subconta.create({
    data: {
      nome: requireString(payload.nome, "nome"),
      tipo: requireEnum(payload.tipo, "tipo", TIPOS_SUBCONTA),
      carteira_id: requireInteger(payload.carteira_id, "carteira_id"),
      ativa: requireBoolean(payload.ativa, "ativa")
    },
    include: {
      carteira: true
    }
  });

  return { item };
}

async function updateSubconta(id, payload) {
  const item = await prisma.subconta.update({
    where: {
      id: requireIdParam(id)
    },
    data: {
      nome: requireString(payload.nome, "nome"),
      tipo: requireEnum(payload.tipo, "tipo", TIPOS_SUBCONTA),
      carteira_id: requireInteger(payload.carteira_id, "carteira_id"),
      ativa: requireBoolean(payload.ativa, "ativa")
    },
    include: {
      carteira: true
    }
  });

  return { item };
}

async function deleteSubconta(id) {
  await prisma.subconta.delete({
    where: {
      id: requireIdParam(id)
    }
  });

  return { success: true };
}

module.exports = { createSubconta, deleteSubconta, listSubcontas, updateSubconta };
