const { prisma } = require("../lib/prisma");
const {
  STATUS_TRANSFERENCIA,
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

function resolveRealizationDate(status, value) {
  const parsedValue = optionalDateString(value, "data_realizacao");

  if (status === "realizada") {
    return parsedValue ?? new Date();
  }

  return null;
}

async function listTransferencias(filters = {}) {
  const where = {};

  if (filters.mes !== undefined) {
    where.mes = optionalQueryInteger(filters.mes, "mes");
  }

  if (filters.ano !== undefined) {
    where.ano = optionalQueryInteger(filters.ano, "ano");
  }

  const items = await prisma.transferencia.findMany({
    where,
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

async function createTransferencia(payload) {
  const item = await prisma.transferencia.create({
    data: {
      data: requireDateString(payload.data, "data"),
      mes: requireInteger(payload.mes, "mes"),
      ano: requireInteger(payload.ano, "ano"),
      valor: requireNumber(payload.valor, "valor"),
      status: requireEnum(payload.status ?? "planejada", "status", STATUS_TRANSFERENCIA),
      data_realizacao: resolveRealizationDate(payload.status ?? "planejada", payload.data_realizacao),
      subconta_origem_id: requireInteger(payload.subconta_origem_id, "subconta_origem_id"),
      subconta_destino_id: requireInteger(payload.subconta_destino_id, "subconta_destino_id"),
      descricao: payload.descricao == null ? null : requireString(payload.descricao, "descricao")
    },
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
    }
  });

  return { item };
}

async function updateTransferencia(id, payload) {
  const item = await prisma.transferencia.update({
    where: {
      id: requireIdParam(id)
    },
    data: {
      data: requireDateString(payload.data, "data"),
      mes: requireInteger(payload.mes, "mes"),
      ano: requireInteger(payload.ano, "ano"),
      valor: requireNumber(payload.valor, "valor"),
      status: requireEnum(payload.status ?? "planejada", "status", STATUS_TRANSFERENCIA),
      data_realizacao: resolveRealizationDate(payload.status ?? "planejada", payload.data_realizacao),
      subconta_origem_id: requireInteger(payload.subconta_origem_id, "subconta_origem_id"),
      subconta_destino_id: requireInteger(payload.subconta_destino_id, "subconta_destino_id"),
      descricao: payload.descricao == null ? null : requireString(payload.descricao, "descricao")
    },
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
    }
  });

  return { item };
}

async function patchTransferencia(id, payload) {
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

  if (payload.status !== undefined) {
    const status = requireEnum(payload.status, "status", STATUS_TRANSFERENCIA);
    data.status = status;
    data.data_realizacao = status === "realizada" ? new Date() : null;
  }

  const item = await prisma.transferencia.update({
    where: {
      id: requireIdParam(id)
    },
    data,
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
    }
  });

  return { item };
}

async function deleteTransferencia(id) {
  await prisma.transferencia.delete({
    where: {
      id: requireIdParam(id)
    }
  });

  return { success: true };
}

module.exports = { createTransferencia, deleteTransferencia, listTransferencias, patchTransferencia, updateTransferencia };
