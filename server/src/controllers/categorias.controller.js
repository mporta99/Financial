const { prisma } = require("../lib/prisma");
const { HttpError } = require("../utils/http-error");
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
  const categoriaId = requireIdParam(id);
  const [lancamentosCount, categoriasSubcontasCount] = await Promise.all([
    prisma.lancamento.count({
      where: {
        categoria_id: categoriaId
      }
    }),
    prisma.categoriaSubconta.count({
      where: {
        categoria_id: categoriaId
      }
    })
  ]);

  if (lancamentosCount > 0 || categoriasSubcontasCount > 0) {
    throw new HttpError(409, "Nao e possivel excluir esta categoria porque existem lancamentos ou subcontas vinculados a ela.");
  }

  await prisma.categoria.delete({
    where: {
      id: categoriaId
    }
  });

  return { success: true };
}

module.exports = { createCategoria, deleteCategoria, listCategorias, updateCategoria };
