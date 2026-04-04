const { prisma } = require("../lib/prisma");
const { HttpError } = require("../utils/http-error");
const { requireBoolean, requireIdParam, requireString } = require("../utils/validators");

async function listPessoas() {
  const items = await prisma.pessoa.findMany({
    orderBy: {
      id: "asc"
    }
  });

  return { items };
}

async function createPessoa(payload) {
  const item = await prisma.pessoa.create({
    data: {
      nome: requireString(payload.nome, "nome"),
      ativa: requireBoolean(payload.ativa, "ativa")
    }
  });

  return { item };
}

async function updatePessoa(id, payload) {
  const item = await prisma.pessoa.update({
    where: {
      id: requireIdParam(id)
    },
    data: {
      nome: requireString(payload.nome, "nome"),
      ativa: requireBoolean(payload.ativa, "ativa")
    }
  });

  return { item };
}

async function deletePessoa(id) {
  const pessoaId = requireIdParam(id);
  const lancamentosCount = await prisma.lancamento.count({
    where: {
      pessoa_id: pessoaId
    }
  });

  if (lancamentosCount > 0) {
    throw new HttpError(409, "Nao e possivel excluir esta pessoa porque existem lancamentos vinculados a ela.");
  }

  await prisma.pessoa.delete({
    where: {
      id: pessoaId
    }
  });

  return { success: true };
}

module.exports = { createPessoa, deletePessoa, listPessoas, updatePessoa };
