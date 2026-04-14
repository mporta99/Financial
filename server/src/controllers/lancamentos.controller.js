const { prisma } = require("../lib/prisma");
const {
  STATUS_LANCAMENTO,
  TIPOS_LANCAMENTO,
  requireBoolean,
  requireDateString,
  requireEnum,
  requireIdParam,
  requireInteger,
  requireNumber,
  requireString
} = require("../utils/validators");

function optionalDateString(value, fieldName) {
  if (value == null || value === "") {
    return null;
  }

  return requireDateString(value, fieldName);
}

function optionalQueryInteger(value, fieldName) {
  if (value == null || value === "") {
    return undefined;
  }

  return requireInteger(Number.parseInt(value, 10), fieldName);
}

function resolvePaymentDate(status, value) {
  const parsedValue = optionalDateString(value, "data_pagamento");

  if (status === "pago") {
    return parsedValue ?? new Date();
  }

  return null;
}

async function listLancamentos(filters = {}) {
  const where = {};

  if (filters.mes !== undefined) {
    where.mes = optionalQueryInteger(filters.mes, "mes");
  }

  if (filters.ano !== undefined) {
    where.ano = optionalQueryInteger(filters.ano, "ano");
  }

  const items = await prisma.lancamento.findMany({
    where,
    include: {
      pessoa: true,
      categoria: true,
      template_lancamento: true,
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
  const status = requireEnum(payload.status ?? "nao_pago", "status", STATUS_LANCAMENTO);
  const item = await prisma.lancamento.create({
    data: {
      data: requireDateString(payload.data, "data"),
      mes: requireInteger(payload.mes, "mes"),
      ano: requireInteger(payload.ano, "ano"),
      valor: requireNumber(payload.valor, "valor"),
      tipo: requireEnum(payload.tipo, "tipo", TIPOS_LANCAMENTO),
      status,
      data_pagamento: resolvePaymentDate(status, payload.data_pagamento),
      pessoa_id: requireInteger(payload.pessoa_id, "pessoa_id"),
      casa: requireBoolean(payload.casa, "casa"),
      categoria_id: requireInteger(payload.categoria_id, "categoria_id"),
      subconta_id: requireInteger(payload.subconta_id, "subconta_id"),
      template_lancamento_id:
        payload.template_lancamento_id == null ? null : requireInteger(payload.template_lancamento_id, "template_lancamento_id"),
      descricao: payload.descricao == null ? null : requireString(payload.descricao, "descricao")
    },
    include: {
      pessoa: true,
      categoria: true,
      template_lancamento: true,
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
  const status = requireEnum(payload.status ?? "nao_pago", "status", STATUS_LANCAMENTO);
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
      status,
      data_pagamento: resolvePaymentDate(status, payload.data_pagamento),
      pessoa_id: requireInteger(payload.pessoa_id, "pessoa_id"),
      casa: requireBoolean(payload.casa, "casa"),
      categoria_id: requireInteger(payload.categoria_id, "categoria_id"),
      subconta_id: requireInteger(payload.subconta_id, "subconta_id"),
      template_lancamento_id:
        payload.template_lancamento_id == null ? null : requireInteger(payload.template_lancamento_id, "template_lancamento_id"),
      descricao: payload.descricao == null ? null : requireString(payload.descricao, "descricao")
    },
    include: {
      pessoa: true,
      categoria: true,
      template_lancamento: true,
      subconta: {
        include: {
          carteira: true
        }
      }
    }
  });

  return { item };
}

async function patchLancamento(id, payload) {
  const data = {};

  if (payload.valor !== undefined) {
    data.valor = requireNumber(payload.valor, "valor");
  }

  if (payload.data !== undefined) {
    const parsedDate = requireDateString(payload.data, "data");
    data.data = parsedDate;
    data.mes = parsedDate.getMonth() + 1;
    data.ano = parsedDate.getFullYear();
  }

  if (payload.subconta_id !== undefined) {
    data.subconta_id = requireInteger(payload.subconta_id, "subconta_id");
  }

  if (payload.status !== undefined) {
    const status = requireEnum(payload.status, "status", STATUS_LANCAMENTO);
    data.status = status;
    data.data_pagamento = status === "pago" ? new Date() : null;
  }

  if (payload.data_pagamento !== undefined && payload.status === undefined) {
    data.data_pagamento = optionalDateString(payload.data_pagamento, "data_pagamento");
  }

  const item = await prisma.lancamento.update({
    where: {
      id: requireIdParam(id)
    },
    data,
    include: {
      pessoa: true,
      categoria: true,
      template_lancamento: true,
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

module.exports = { createLancamento, deleteLancamento, listLancamentos, patchLancamento, updateLancamento };
