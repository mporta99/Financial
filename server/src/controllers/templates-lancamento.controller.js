const { prisma } = require("../lib/prisma");
const { HttpError } = require("../utils/http-error");
const {
  FREQUENCIAS_TEMPLATE,
  TIPOS_GERACAO_TEMPLATE,
  requireBoolean,
  requireEnum,
  requireIdParam,
  requireInteger,
  requireNumber,
  requireString
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

async function listTemplatesLancamento() {
  const items = await prisma.templateLancamento.findMany({
    include: {
      categoria: true,
      itens_template: {
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

async function createTemplateLancamento(payload) {
  const item = await prisma.templateLancamento.create({
    data: {
      nome: requireString(payload.nome, "nome"),
      categoria_id: requireInteger(payload.categoria_id, "categoria_id"),
      ativo: requireBoolean(payload.ativo, "ativo"),
      frequencia: requireEnum(payload.frequencia, "frequencia", FREQUENCIAS_TEMPLATE),
      tipo_geracao: requireEnum(payload.tipo_geracao, "tipo_geracao", TIPOS_GERACAO_TEMPLATE),
      dia_fixo: optionalInteger(payload.dia_fixo, "dia_fixo"),
      tem_valor_fixo: requireBoolean(payload.tem_valor_fixo, "tem_valor_fixo"),
      valor_padrao: optionalNumber(payload.valor_padrao, "valor_padrao"),
      gera_lancamento: requireBoolean(payload.gera_lancamento, "gera_lancamento")
    },
    include: {
      categoria: true,
      itens_template: {
        include: {
          categoria: true
        }
      }
    }
  });

  return { item };
}

async function updateTemplateLancamento(id, payload) {
  const item = await prisma.templateLancamento.update({
    where: {
      id: requireIdParam(id)
    },
    data: {
      nome: requireString(payload.nome, "nome"),
      categoria_id: requireInteger(payload.categoria_id, "categoria_id"),
      ativo: requireBoolean(payload.ativo, "ativo"),
      frequencia: requireEnum(payload.frequencia, "frequencia", FREQUENCIAS_TEMPLATE),
      tipo_geracao: requireEnum(payload.tipo_geracao, "tipo_geracao", TIPOS_GERACAO_TEMPLATE),
      dia_fixo: optionalInteger(payload.dia_fixo, "dia_fixo"),
      tem_valor_fixo: requireBoolean(payload.tem_valor_fixo, "tem_valor_fixo"),
      valor_padrao: optionalNumber(payload.valor_padrao, "valor_padrao"),
      gera_lancamento: requireBoolean(payload.gera_lancamento, "gera_lancamento")
    },
    include: {
      categoria: true,
      itens_template: {
        include: {
          categoria: true
        }
      }
    }
  });

  return { item };
}

async function deleteTemplateLancamento(id) {
  const templateId = requireIdParam(id);
  const itensCount = await prisma.itemTemplate.count({
    where: {
      template_pai_id: templateId
    }
  });

  if (itensCount > 0) {
    throw new HttpError(409, "Nao e possivel excluir este template porque existem itens vinculados a ele.");
  }

  await prisma.templateLancamento.delete({
    where: {
      id: templateId
    }
  });

  return { success: true };
}

module.exports = {
  createTemplateLancamento,
  deleteTemplateLancamento,
  listTemplatesLancamento,
  updateTemplateLancamento
};
