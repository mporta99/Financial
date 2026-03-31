const { prisma } = require("../lib/prisma");
const { HttpError } = require("../utils/http-error");
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
  const subcontaId = requireIdParam(id);
  const [lancamentosCount, transferenciasOrigemCount, transferenciasDestinoCount, categoriasSubcontasCount] =
    await Promise.all([
      prisma.lancamento.count({
        where: {
          subconta_id: subcontaId
        }
      }),
      prisma.transferencia.count({
        where: {
          subconta_origem_id: subcontaId
        }
      }),
      prisma.transferencia.count({
        where: {
          subconta_destino_id: subcontaId
        }
      }),
      prisma.categoriaSubconta.count({
        where: {
          subconta_id: subcontaId
        }
      })
    ]);

  if (lancamentosCount > 0 || transferenciasOrigemCount > 0 || transferenciasDestinoCount > 0 || categoriasSubcontasCount > 0) {
    throw new HttpError(
      409,
      "Nao e possivel excluir esta subconta porque existem lancamentos, transferencias ou categorias vinculadas a ela."
    );
  }

  await prisma.subconta.delete({
    where: {
      id: subcontaId
    }
  });

  return { success: true };
}

module.exports = { createSubconta, deleteSubconta, listSubcontas, updateSubconta };
