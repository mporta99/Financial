const { prisma } = require("../lib/prisma");
const { HttpError } = require("../utils/http-error");
const { requireIdParam, requireInteger } = require("../utils/validators");

function buildCompetenciaDate(ano, mes, dia) {
  const lastDay = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const safeDay = Math.max(1, Math.min(dia ?? 1, lastDay));
  return new Date(Date.UTC(ano, mes - 1, safeDay));
}

function buildOccurrenceDay(ano, mes, quantidadeMensal, ocorrenciaMes, diaFixo) {
  if (quantidadeMensal <= 1) {
    return diaFixo ?? 1;
  }

  const lastDay = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  return Math.max(1, Math.min(Math.round((lastDay * ocorrenciaMes) / quantidadeMensal), lastDay));
}

function buildTemplateDescription(template, mes, ano, ocorrenciaMes, quantidadeMensal) {
  const competencia = `${String(mes).padStart(2, "0")}/${ano}`;

  if (quantidadeMensal <= 1) {
    return `${template.nome} ${competencia}`;
  }

  return `${template.nome} ${ocorrenciaMes}/${quantidadeMensal} ${competencia}`;
}

function buildEmbeddedDescription(itemTemplate, template, mes, ano, ocorrenciaMes, quantidadeMensal) {
  const competencia = `${String(mes).padStart(2, "0")}/${ano}`;

  if (quantidadeMensal <= 1) {
    return `${itemTemplate.categoria.nome} em ${template.nome} ${competencia}`;
  }

  return `${itemTemplate.categoria.nome} em ${template.nome} ${ocorrenciaMes}/${quantidadeMensal} ${competencia}`;
}

async function findDuplicateLancamento({ templateId, itemTemplateId = null, pessoaId, ano, mes, ocorrenciaMes }) {
  return prisma.lancamento.findFirst({
    where: {
      template_lancamento_id: templateId,
      item_template_id: itemTemplateId,
      pessoa_id: pessoaId,
      ano,
      mes,
      ...(ocorrenciaMes === 1
        ? {
            OR: [{ ocorrencia_mes: 1 }, { ocorrencia_mes: null }]
          }
        : {
            ocorrencia_mes: ocorrenciaMes
          })
    }
  });
}

async function gerarMes(payload) {
  const ano = requireInteger(payload.ano, "ano");
  const mes = requireInteger(payload.mes, "mes");
  const pessoaId = requireIdParam(payload.pessoa_id, "pessoa_id");

  if (mes < 1 || mes > 12) {
    throw new HttpError(400, "Field 'mes' must be between 1 and 12");
  }

  const pessoa = await prisma.pessoa.findUnique({
    where: {
      id: pessoaId
    }
  });

  if (!pessoa) {
    throw new HttpError(404, "Pessoa nao encontrada.");
  }

  const templates = await prisma.templateLancamento.findMany({
    where: {
      ativo: true,
      gera_lancamento: true,
      OR: [{ pessoa_id: null }, { pessoa_id: pessoaId }]
    },
    include: {
      categoria: true,
      pessoa: true,
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

  const generated = [];
  const skipped = [];

  for (const template of templates) {
    if (!template.categoria?.subconta_id) {
      skipped.push({
        template_id: template.id,
        nome: template.nome,
        motivo: "categoria_sem_subconta_padrao"
      });
      continue;
    }

    const quantidadeMensal = Math.max(1, Number(template.quantidade_mensal ?? 1));

    for (let ocorrenciaMes = 1; ocorrenciaMes <= quantidadeMensal; ocorrenciaMes += 1) {
      const duplicate = await findDuplicateLancamento({
        templateId: template.id,
        pessoaId,
        ano,
        mes,
        ocorrenciaMes
      });

      if (duplicate) {
        skipped.push({
          template_id: template.id,
          nome: buildTemplateDescription(template, mes, ano, ocorrenciaMes, quantidadeMensal),
          motivo: "ja_existente"
        });
        continue;
      }

      const item = await prisma.lancamento.create({
        data: {
          data: buildCompetenciaDate(ano, mes, buildOccurrenceDay(ano, mes, quantidadeMensal, ocorrenciaMes, template.dia_fixo)),
          mes,
          ano,
          ocorrencia_mes: ocorrenciaMes,
          valor: Number(template.valor_padrao ?? 0),
          tipo: template.categoria.tipo,
          status: "nao_pago",
          data_pagamento: null,
          contabiliza_saldo: true,
          pessoa_id: pessoaId,
          casa: template.categoria.casa,
          categoria_id: template.categoria_id,
          subconta_id: template.categoria.subconta_id,
          template_lancamento_id: template.id,
          descricao: buildTemplateDescription(template, mes, ano, ocorrenciaMes, quantidadeMensal)
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

      generated.push(item);

      for (const itemTemplate of template.itens_template) {
        const duplicateEmbedded = await findDuplicateLancamento({
          templateId: template.id,
          itemTemplateId: itemTemplate.id,
          pessoaId,
          ano,
          mes,
          ocorrenciaMes
        });

        if (duplicateEmbedded) {
          skipped.push({
            template_id: template.id,
            nome: buildEmbeddedDescription(itemTemplate, template, mes, ano, ocorrenciaMes, quantidadeMensal),
            motivo: "item_embutido_ja_existente"
          });
          continue;
        }

        if (!itemTemplate.categoria?.subconta_id) {
          skipped.push({
            template_id: template.id,
            nome: buildEmbeddedDescription(itemTemplate, template, mes, ano, ocorrenciaMes, quantidadeMensal),
            motivo: "item_embutido_sem_subconta_padrao"
          });
          continue;
        }

        const embeddedItem = await prisma.lancamento.create({
          data: {
            data: buildCompetenciaDate(
              ano,
              mes,
              buildOccurrenceDay(ano, mes, quantidadeMensal, ocorrenciaMes, itemTemplate.dia_fixo ?? template.dia_fixo)
            ),
            mes,
            ano,
            ocorrencia_mes: ocorrenciaMes,
            valor: Number(itemTemplate.valor_padrao ?? 0),
            tipo: itemTemplate.categoria.tipo,
            status: "nao_pago",
            data_pagamento: null,
            contabiliza_saldo: false,
            pessoa_id: pessoaId,
            casa: itemTemplate.categoria.casa,
            categoria_id: itemTemplate.categoria_id,
            subconta_id: itemTemplate.categoria.subconta_id,
            template_lancamento_id: template.id,
            item_template_id: itemTemplate.id,
            descricao: buildEmbeddedDescription(itemTemplate, template, mes, ano, ocorrenciaMes, quantidadeMensal)
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

        generated.push(embeddedItem);
      }
    }
  }

  return {
    generated,
    skipped,
    meta: {
      pessoa_id: pessoaId,
      mes,
      ano
    }
  };
}

module.exports = { gerarMes };
