const { prisma } = require("../lib/prisma");
const { HttpError } = require("../utils/http-error");
const { GRUPOS_CATEGORIA, TIPOS_CATEGORIA, requireBoolean, requireEnum, requireIdParam, requireInteger, requireString } = require("../utils/validators");

async function listCategorias() {
  const items = await prisma.categoria.findMany({
    include: {
      subconta_padrao: {
        include: {
          carteira: true
        }
      }
    },
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
      grupo: requireEnum(payload.grupo, "grupo", GRUPOS_CATEGORIA),
      ativa: requireBoolean(payload.ativa, "ativa"),
      casa: requireBoolean(payload.casa, "casa"),
      embutido: requireBoolean(payload.embutido, "embutido"),
      subconta_id: payload.subconta_id == null ? null : requireInteger(payload.subconta_id, "subconta_id")
    },
    include: {
      subconta_padrao: {
        include: {
          carteira: true
        }
      }
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
      grupo: requireEnum(payload.grupo, "grupo", GRUPOS_CATEGORIA),
      ativa: requireBoolean(payload.ativa, "ativa"),
      casa: requireBoolean(payload.casa, "casa"),
      embutido: requireBoolean(payload.embutido, "embutido"),
      subconta_id: payload.subconta_id == null ? null : requireInteger(payload.subconta_id, "subconta_id")
    },
    include: {
      subconta_padrao: {
        include: {
          carteira: true
        }
      }
    }
  });

  return { item };
}

async function deleteCategoria(id) {
  const categoriaId = requireIdParam(id);
  const [lancamentosCount, categoriasSubcontasCount, templatesLancamentoCount, itensTemplateCount] = await Promise.all([
    prisma.lancamento.count({
      where: {
        categoria_id: categoriaId
      }
    }),
    prisma.categoriaSubconta.count({
      where: {
        categoria_id: categoriaId
      }
    }),
    prisma.templateLancamento.count({
      where: {
        categoria_id: categoriaId
      }
    }),
    prisma.itemTemplate.count({
      where: {
        categoria_id: categoriaId
      }
    })
  ]);

  if (lancamentosCount > 0 || categoriasSubcontasCount > 0 || templatesLancamentoCount > 0 || itensTemplateCount > 0) {
    throw new HttpError(409, "Nao e possivel excluir esta categoria porque existem registros vinculados a ela.");
  }

  await prisma.categoria.delete({
    where: {
      id: categoriaId
    }
  });

  return { success: true };
}

module.exports = { createCategoria, deleteCategoria, listCategorias, updateCategoria };
