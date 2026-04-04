const { prisma } = require("../lib/prisma");
const {
  requireBoolean,
  requireIdParam,
  requireInteger,
  requireNumber
} = require("../utils/validators");

function optionalInteger(value, fieldName) {
  if (value == null || value === "") {
    return null;
  }

  return requireInteger(value, fieldName);
}

function optionalNumber(value, fieldName) {
  if (value == null || value === "") {
    return null;
  }

  return requireNumber(value, fieldName);
}

async function listItensTemplate() {
  const items = await prisma.itemTemplate.findMany({
    include: {
      categoria: true,
      template_pai: {
        include: {
          categoria: true
        }
      }
    },
    orderBy: {
      id: "asc"
    }
  });

  return { items };
}

async function createItemTemplate(payload) {
  const item = await prisma.itemTemplate.create({
    data: {
      template_pai_id: requireInteger(payload.template_pai_id, "template_pai_id"),
      categoria_id: requireInteger(payload.categoria_id, "categoria_id"),
      tem_valor_fixo: requireBoolean(payload.tem_valor_fixo, "tem_valor_fixo"),
      valor_padrao: optionalNumber(payload.valor_padrao, "valor_padrao"),
      dia_fixo: optionalInteger(payload.dia_fixo, "dia_fixo")
    },
    include: {
      categoria: true,
      template_pai: {
        include: {
          categoria: true
        }
      }
    }
  });

  return { item };
}

async function updateItemTemplate(id, payload) {
  const item = await prisma.itemTemplate.update({
    where: {
      id: requireIdParam(id)
    },
    data: {
      template_pai_id: requireInteger(payload.template_pai_id, "template_pai_id"),
      categoria_id: requireInteger(payload.categoria_id, "categoria_id"),
      tem_valor_fixo: requireBoolean(payload.tem_valor_fixo, "tem_valor_fixo"),
      valor_padrao: optionalNumber(payload.valor_padrao, "valor_padrao"),
      dia_fixo: optionalInteger(payload.dia_fixo, "dia_fixo")
    },
    include: {
      categoria: true,
      template_pai: {
        include: {
          categoria: true
        }
      }
    }
  });

  return { item };
}

async function deleteItemTemplate(id) {
  await prisma.itemTemplate.delete({
    where: {
      id: requireIdParam(id)
    }
  });

  return { success: true };
}

module.exports = { createItemTemplate, deleteItemTemplate, listItensTemplate, updateItemTemplate };
