const { prisma } = require("../lib/prisma");
const { TIPOS_CATEGORIA, requireBoolean, requireEnum, requireIdParam, requireString } = require("../utils/validators");

async function listCategorias() {
  const items = await prisma.categoria.findMany({
    orderBy: [
      { tipo: "asc" },
      { id: "asc" }
    ]
  });

  return { items };
}

async function createCategoria(payload) {
  const item = await prisma.categoria.create({
    data: {
      nome: requireString(payload.nome, "nome"),
      tipo: requireEnum(payload.tipo, "tipo", TIPOS_CATEGORIA),
      grupo: requireString(payload.grupo, "grupo"),
      ativa: requireBoolean(payload.ativa, "ativa")
    }
  });

  return { item };
}

async function updateCategoria(id, payload) {
  const item = await prisma.categoria.update({
    where: {
      id: requireIdParam(id)
    },
    data: {
      nome: requireString(payload.nome, "nome"),
      tipo: requireEnum(payload.tipo, "tipo", TIPOS_CATEGORIA),
      grupo: requireString(payload.grupo, "grupo"),
      ativa: requireBoolean(payload.ativa, "ativa")
    }
  });

  return { item };
}

async function deleteCategoria(id) {
  await prisma.categoria.delete({
    where: {
      id: requireIdParam(id)
    }
  });

  return { success: true };
}

module.exports = { createCategoria, deleteCategoria, listCategorias, updateCategoria };
