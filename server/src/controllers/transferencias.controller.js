const { prisma } = require("../lib/prisma");
const { requireDateString, requireIdParam, requireInteger, requireNumber, requireString } = require("../utils/validators");

async function listTransferencias() {
  const items = await prisma.transferencia.findMany({
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
      valor: requireNumber(payload.valor, "valor"),
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
      valor: requireNumber(payload.valor, "valor"),
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

async function deleteTransferencia(id) {
  await prisma.transferencia.delete({
    where: {
      id: requireIdParam(id)
    }
  });

  return { success: true };
}

module.exports = { createTransferencia, deleteTransferencia, listTransferencias, updateTransferencia };
