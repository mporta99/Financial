import { getResourceList } from "./resources";

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isFaturaItem(item) {
  const categoria = normalizeText(item.categoria?.nome);
  const template = normalizeText(item.template_lancamento?.nome);
  const descricao = normalizeText(item.descricao);
  return categoria.includes("fatura") || template.includes("fatura") || descricao.includes("fatura");
}

function isOutrosItem(item) {
  return normalizeText(item.categoria?.nome) === "outros";
}

function isFaturaName(value) {
  return normalizeText(value).includes("fatura");
}

function isOutrosName(value) {
  return normalizeText(value) === "outros";
}

function adjustFaturaCards(lancamentos) {
  return lancamentos.map((card) => {
    const isParentFatura =
      card.item_template_id == null &&
      (isFaturaName(card.template_lancamento?.nome) || isFaturaName(card.categoria?.nome) || isFaturaName(card.descricao));

    if (isParentFatura) {
      const unpaidEmbeddedTotal = lancamentos
        .filter(
          (candidate) =>
            candidate.item_template_id != null &&
            candidate.template_lancamento_id === card.template_lancamento_id &&
            candidate.pessoa_id === card.pessoa_id &&
            candidate.ano === card.ano &&
            candidate.mes === card.mes &&
            candidate.status !== "pago" &&
            !isOutrosName(candidate.categoria?.nome)
        )
        .reduce((total, candidate) => total + Number(candidate.valor), 0);

      return {
        ...card,
        valor_fatura_aberta: Number(card.valor) + unpaidEmbeddedTotal
      };
    }

    const isOutrosFatura =
      card.item_template_id != null &&
      isOutrosName(card.categoria?.nome) &&
      (isFaturaName(card.template_lancamento?.nome) || isFaturaName(card.descricao));

    if (!isOutrosFatura) {
      return card;
    }

    const parentCard = lancamentos.find(
      (candidate) =>
        candidate.item_template_id == null &&
        candidate.template_lancamento_id === card.template_lancamento_id &&
        candidate.pessoa_id === card.pessoa_id &&
        candidate.ano === card.ano &&
        candidate.mes === card.mes &&
        isFaturaName(candidate.template_lancamento?.nome || candidate.descricao)
    );

    if (!parentCard || parentCard.status === "pago") {
      return card;
    }

    const paidEmbeddedTotal = lancamentos
      .filter(
        (candidate) =>
          candidate.id !== card.id &&
          candidate.item_template_id != null &&
          candidate.template_lancamento_id === card.template_lancamento_id &&
          candidate.pessoa_id === card.pessoa_id &&
          candidate.ano === card.ano &&
          candidate.mes === card.mes &&
          candidate.status === "pago" &&
          !isOutrosName(candidate.categoria?.nome)
      )
      .reduce((total, candidate) => total + Number(candidate.valor), 0);

    return {
      ...card,
      valor: Number(parentCard.valor) - paidEmbeddedTotal
    };
  });
}

function computeMarcusCompetencia(date = new Date()) {
  const competencia = new Date(date);
  const day = competencia.getDate();

  if (day >= 25) {
    competencia.setMonth(competencia.getMonth() + 1);
  }

  return {
    mes: competencia.getMonth() + 1,
    ano: competencia.getFullYear()
  };
}

function isAteCompetencia(item, mes, ano) {
  return Number(item.ano) < Number(ano) || (Number(item.ano) === Number(ano) && Number(item.mes) <= Number(mes));
}

function computeSaldoAcm(subcontaId, lancamentos, transferencias) {
  let saldo = 0;

  lancamentos.forEach((lancamento) => {
    if (Number(lancamento.subconta_id) !== Number(subcontaId) || lancamento.contabiliza_saldo === false) {
      return;
    }

    if (lancamento.tipo === "entrada") {
      saldo += Number(lancamento.valor);
      return;
    }

    if (lancamento.status === "pago") {
      saldo -= Number(lancamento.valor);
    }
  });

  transferencias.forEach((transferencia) => {
    if (transferencia.status !== "realizada") {
      return;
    }

    const value = Number(transferencia.valor);

    if (Number(transferencia.subconta_origem_id) === Number(subcontaId)) {
      saldo -= value;
    }

    if (Number(transferencia.subconta_destino_id) === Number(subcontaId)) {
      saldo += value;
    }
  });

  return saldo;
}

function computePlanAcm(subcontaId, lancamentos, transferencias) {
  let saldo = 0;

  lancamentos.forEach((lancamento) => {
    if (Number(lancamento.subconta_id) !== Number(subcontaId) || lancamento.contabiliza_saldo === false) {
      return;
    }

    if (lancamento.tipo === "entrada") {
      saldo += Number(lancamento.valor);
      return;
    }

    saldo -= Number(lancamento.valor_fatura_aberta ?? lancamento.valor);
  });

  transferencias.forEach((transferencia) => {
    const value = Number(transferencia.valor);

    if (Number(transferencia.subconta_origem_id) === Number(subcontaId)) {
      saldo -= value;
    }

    if (Number(transferencia.subconta_destino_id) === Number(subcontaId)) {
      saldo += value;
    }
  });

  return saldo;
}

async function getDashboardSummary({ mes, ano } = {}) {
  const [pessoas, carteiras, subcontas, templatesLancamento, lancamentos, transferencias] = await Promise.all([
    getResourceList("pessoas"),
    getResourceList("carteiras"),
    getResourceList("subcontas"),
    getResourceList("templates-lancamento"),
    getResourceList("lancamentos"),
    getResourceList("transferencias")
  ]);

  const competenciaAtual = mes && ano ? { mes: Number(mes), ano: Number(ano) } : computeMarcusCompetencia();
  const anosDisponiveis = [...new Set([...lancamentos, ...transferencias].map((item) => Number(item.ano)).filter(Boolean))].sort((a, b) => a - b);

  const nubankSalario = subcontas.find(
    (item) =>
      item.carteira?.nome === "Nubank" &&
      item.nome === "Conta Salario"
  );
  const ciacardConta = subcontas.find(
    (item) =>
      item.carteira?.nome === "Ciacard" &&
      item.nome === "Ciacard"
  );
  const pluxeeAlimentacao = subcontas.find(
    (item) =>
      item.carteira?.nome === "Pluxee" &&
      item.nome === "Alimentacao"
  );
  const pluxeeRefeicao = subcontas.find(
    (item) =>
      item.carteira?.nome === "Pluxee" &&
      item.nome === "Refeicao"
  );
  const subcontasInvestimento = subcontas.filter((item) => item.tipo === "investimento");

  const lancamentosAcumulados = lancamentos.filter((item) => isAteCompetencia(item, competenciaAtual.mes, competenciaAtual.ano));
  const lancamentosAcumuladosAjustados = adjustFaturaCards(lancamentosAcumulados);
  const transferenciasAcumuladas = transferencias.filter((item) => isAteCompetencia(item, competenciaAtual.mes, competenciaAtual.ano));

  const nubankSalarioBox = nubankSalario
    ? {
        subcontaId: nubankSalario.id,
        carteiraNome: nubankSalario.carteira?.nome ?? "Nubank",
        subcontaNome: nubankSalario.nome,
        saldoAcm: computeSaldoAcm(nubankSalario.id, lancamentosAcumuladosAjustados, transferenciasAcumuladas),
        planAcm: computePlanAcm(nubankSalario.id, lancamentosAcumuladosAjustados, transferenciasAcumuladas)
      }
    : null;

  const ciacardBox = ciacardConta
    ? {
        subcontaId: ciacardConta.id,
        carteiraNome: ciacardConta.carteira?.nome ?? "Ciacard",
        subcontaNome: ciacardConta.nome,
        saldoAcm: computeSaldoAcm(ciacardConta.id, lancamentosAcumuladosAjustados, transferenciasAcumuladas),
        planAcm: computePlanAcm(ciacardConta.id, lancamentosAcumuladosAjustados, transferenciasAcumuladas)
      }
    : null;

  const pluxeeAlimentacaoBox = pluxeeAlimentacao
    ? {
        subcontaId: pluxeeAlimentacao.id,
        carteiraNome: pluxeeAlimentacao.carteira?.nome ?? "Pluxee",
        subcontaNome: pluxeeAlimentacao.nome,
        saldoAcm: computeSaldoAcm(pluxeeAlimentacao.id, lancamentosAcumuladosAjustados, transferenciasAcumuladas),
        planAcm: computePlanAcm(pluxeeAlimentacao.id, lancamentosAcumuladosAjustados, transferenciasAcumuladas)
      }
    : null;

  const pluxeeRefeicaoBox = pluxeeRefeicao
    ? {
        subcontaId: pluxeeRefeicao.id,
        carteiraNome: pluxeeRefeicao.carteira?.nome ?? "Pluxee",
        subcontaNome: pluxeeRefeicao.nome,
        saldoAcm: computeSaldoAcm(pluxeeRefeicao.id, lancamentosAcumuladosAjustados, transferenciasAcumuladas),
        planAcm: computePlanAcm(pluxeeRefeicao.id, lancamentosAcumuladosAjustados, transferenciasAcumuladas)
      }
    : null;

  const investimentosBoxes = Object.values(
    subcontasInvestimento.reduce((groups, item) => {
      const carteiraNome = item.carteira?.nome ?? "Investimentos";

      if (!groups[carteiraNome]) {
        groups[carteiraNome] = {
          carteiraNome,
          itens: []
        };
      }

      groups[carteiraNome].itens.push({
        id: item.id,
        carteiraNome,
        subcontaNome: item.nome,
        saldoAcm: computeSaldoAcm(item.id, lancamentosAcumuladosAjustados, transferenciasAcumuladas),
        planAcm: computePlanAcm(item.id, lancamentosAcumuladosAjustados, transferenciasAcumuladas)
      });

      return groups;
    }, {})
  )
    .map((group) => ({
      ...group,
      saldoAcm: group.itens.reduce((total, item) => total + Number(item.saldoAcm), 0),
      planAcm: group.itens.reduce((total, item) => total + Number(item.planAcm), 0)
    }))
    .sort((left, right) => left.carteiraNome.localeCompare(right.carteiraNome, "pt-BR"));

  const nubankSalarioContasPagar = nubankSalario
    ? lancamentos
        .filter(
          (item) =>
            Number(item.subconta_id) === Number(nubankSalario.id) &&
            Number(item.mes) === Number(competenciaAtual.mes) &&
            Number(item.ano) === Number(competenciaAtual.ano) &&
            item.tipo === "saida" &&
            item.status === "nao_pago" &&
            !isFaturaItem(item)
        )
        .sort((left, right) => new Date(left.data) - new Date(right.data))
        .map((item) => ({
          id: item.id,
          descricao: item.descricao ?? item.categoria?.nome ?? `Lancamento ${item.id}`,
          categoriaNome: item.categoria?.nome ?? "-",
          data: item.data,
          valor: Number(item.valor)
        }))
    : [];

  const ciacardContasPagar = ciacardConta
    ? lancamentos
        .filter(
          (item) =>
            Number(item.subconta_id) === Number(ciacardConta.id) &&
            Number(item.mes) === Number(competenciaAtual.mes) &&
            Number(item.ano) === Number(competenciaAtual.ano) &&
            item.tipo === "saida" &&
            item.status === "nao_pago" &&
            !isFaturaItem(item)
        )
        .sort((left, right) => new Date(left.data) - new Date(right.data))
        .map((item) => ({
          id: item.id,
          descricao: item.descricao ?? item.categoria?.nome ?? `Lancamento ${item.id}`,
          categoriaNome: item.categoria?.nome ?? "-",
          data: item.data,
          valor: Number(item.valor)
        }))
    : [];

  const pluxeeAlimentacaoContasPagar = pluxeeAlimentacao
    ? lancamentos
        .filter(
          (item) =>
            Number(item.subconta_id) === Number(pluxeeAlimentacao.id) &&
            Number(item.mes) === Number(competenciaAtual.mes) &&
            Number(item.ano) === Number(competenciaAtual.ano) &&
            item.tipo === "saida" &&
            item.status === "nao_pago" &&
            !isFaturaItem(item)
        )
        .sort((left, right) => new Date(left.data) - new Date(right.data))
        .map((item) => ({
          id: item.id,
          descricao: item.descricao ?? item.categoria?.nome ?? `Lancamento ${item.id}`,
          categoriaNome: item.categoria?.nome ?? "-",
          data: item.data,
          valor: Number(item.valor)
        }))
    : [];

  const pluxeeRefeicaoContasPagar = pluxeeRefeicao
    ? lancamentos
        .filter(
          (item) =>
            Number(item.subconta_id) === Number(pluxeeRefeicao.id) &&
            Number(item.mes) === Number(competenciaAtual.mes) &&
            Number(item.ano) === Number(competenciaAtual.ano) &&
            item.tipo === "saida" &&
            item.status === "nao_pago" &&
            !isFaturaItem(item)
        )
        .sort((left, right) => new Date(left.data) - new Date(right.data))
        .map((item) => ({
          id: item.id,
          descricao: item.descricao ?? item.categoria?.nome ?? `Lancamento ${item.id}`,
          categoriaNome: item.categoria?.nome ?? "-",
          data: item.data,
          valor: Number(item.valor)
        }))
    : [];

  const nubankSalarioFaturaBase = nubankSalario
    ? lancamentos.find(
        (item) =>
          Number(item.subconta_id) === Number(nubankSalario.id) &&
          Number(item.mes) === Number(competenciaAtual.mes) &&
          Number(item.ano) === Number(competenciaAtual.ano) &&
          item.tipo === "saida" &&
          item.status === "nao_pago" &&
          item.item_template_id == null &&
          isFaturaItem(item)
      )
    : null;

  const nubankSalarioFaturaItens = nubankSalarioFaturaBase
    ? lancamentos
        .filter(
          (item) =>
            Number(item.subconta_id) === Number(nubankSalario.id) &&
            Number(item.mes) === Number(competenciaAtual.mes) &&
            Number(item.ano) === Number(competenciaAtual.ano) &&
            item.item_template_id != null &&
            Number(item.template_lancamento_id) === Number(nubankSalarioFaturaBase.template_lancamento_id) &&
            item.status !== "pago"
        )
        .sort((left, right) => new Date(left.data) - new Date(right.data))
        .map((item) => ({
          id: item.id,
          descricao: item.descricao ?? item.categoria?.nome ?? `Item ${item.id}`,
          categoriaNome: item.categoria?.nome ?? "-",
          data: item.data,
          valor: Number(item.valor),
          status: item.status
        }))
    : [];

  const nubankSalarioFatura = nubankSalarioFaturaBase
    ? {
        id: nubankSalarioFaturaBase.id,
        descricao: nubankSalarioFaturaBase.descricao ?? "Fatura",
        data: nubankSalarioFaturaBase.data,
        valor: Number(nubankSalarioFaturaBase.valor),
        valorPlanejado:
          Number(nubankSalarioFaturaBase.valor) +
          nubankSalarioFaturaItens
            .filter((item) => !isOutrosItem({ categoria: { nome: item.categoriaNome } }))
            .reduce((total, item) => total + Number(item.valor), 0),
        itens: nubankSalarioFaturaItens
      }
    : null;

  return {
    competenciaAtual,
    anosDisponiveis,
    nubankSalarioBox,
    nubankSalarioContasPagar,
    nubankSalarioFatura,
    ciacardBox,
    ciacardContasPagar,
    pluxeeAlimentacaoBox,
    pluxeeAlimentacaoContasPagar,
    pluxeeRefeicaoBox,
    pluxeeRefeicaoContasPagar,
    investimentosBoxes,
    pessoas: pessoas.length,
    carteiras: carteiras.length,
    subcontas: subcontas.length,
    templatesLancamento: templatesLancamento.length,
    lancamentos: lancamentos.length,
    transferencias: transferencias.length
  };
}

async function getMovementData({ mes, ano } = {}) {
  const [carteiras, subcontas, pessoas, categorias, lancamentos, transferencias, lancamentosTodos, transferenciasTodas] = await Promise.all([
    getResourceList("carteiras"),
    getResourceList("subcontas"),
    getResourceList("pessoas"),
    getResourceList("categorias"),
    getResourceList("lancamentos", { mes, ano }),
    getResourceList("transferencias", { mes, ano }),
    getResourceList("lancamentos"),
    getResourceList("transferencias")
  ]);

  const isAteCompetencia = (item) => Number(item.ano) < Number(ano) || (Number(item.ano) === Number(ano) && Number(item.mes) <= Number(mes));

  return {
    carteiras,
    subcontas,
    pessoas,
    categorias,
    lancamentos,
    transferencias,
    lancamentosAcumulados: lancamentosTodos.filter(isAteCompetencia),
    transferenciasAcumuladas: transferenciasTodas.filter(isAteCompetencia)
  };
}

async function getMovementCompetencias() {
  const [lancamentos, transferencias] = await Promise.all([
    getResourceList("lancamentos"),
    getResourceList("transferencias")
  ]);

  const anos = [...new Set([...lancamentos, ...transferencias].map((item) => Number(item.ano)).filter(Boolean))].sort((a, b) => a - b);

  return { anos };
}

export { getDashboardSummary, getMovementCompetencias, getMovementData };
