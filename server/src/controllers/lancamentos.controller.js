const { prisma } = require("../lib/prisma");
const {
  TIPOS_LANCAMENTO,
  requireBoolean,
  requireDateString,
  requireEnum,
  requireIdParam,
  requireInteger,
  requireNumber,
  requireString
} = require("../utils/validators");

async function listLancamentos() {
  const items = await prisma.lancamento.findMany({
    include: {
      pessoa: true,
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

async function createLancamento(payload) {
  const item = await prisma.lancamento.create({
    data: {
      data: requireDateString(payload.data, "data"),
      mes: requireInteger(payload.mes, "mes"),
      ano: requireInteger(payload.ano, "ano"),
      valor: requireNumber(payload.valor, "valor"),
      tipo: requireEnum(payload.tipo, "tipo", TIPOS_LANCAMENTO),
      pessoa_id: requireInteger(payload.pessoa_id, "pessoa_id"),
      eh_casa: requireBoolean(payload.eh_casa, "eh_casa"),
      categoria_id: requireInteger(payload.categoria_id, "categoria_id"),
      subconta_id: requireInteger(payload.subconta_id, "subconta_id"),
      descricao: payload.descricao == null ? null : requireString(payload.descricao, "descricao")
    },
    include: {
      pessoa: true,
      categoria: true,
      subconta: {
        include: {
          carteira: true
        }
      }
    }
  });

  return { item };
}

async function updateLancamento(id, payload) {
  const item = await prisma.lancamento.update({
    where: {
      id: requireIdParam(id)
    },
    data: {
      data: requireDateString(payload.data, "data"),
      mes: requireInteger(payload.mes, "mes"),
      ano: requireInteger(payload.ano, "ano"),
      valor: requireNumber(payload.valor, "valor"),
      tipo: requireEnum(payload.tipo, "tipo", TIPOS_LANCAMENTO),
      pessoa_id: requireInteger(payload.pessoa_id, "pessoa_id"),
      eh_casa: requireBoolean(payload.eh_casa, "eh_casa"),
      categoria_id: requireInteger(payload.categoria_id, "categoria_id"),
      subconta_id: requireInteger(payload.subconta_id, "subconta_id"),
      descricao: payload.descricao == null ? null : requireString(payload.descricao, "descricao")
    },
    include: {
      pessoa: true,
      categoria: true,
      subconta: {
        include: {
          carteira: true
        }
      }
    }
  });

  return { item };
}

async function deleteLancamento(id) {
  await prisma.lancamento.delete({
    where: {
      id: requireIdParam(id)
    }
  });

  return { success: true };
}

module.exports = { createLancamento, deleteLancamento, listLancamentos, updateLancamento };
