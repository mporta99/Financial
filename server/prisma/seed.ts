import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.itemTemplate.deleteMany();
  await prisma.templateLancamento.deleteMany();
  await prisma.categoriaSubconta.deleteMany();
  await prisma.transferencia.deleteMany();
  await prisma.lancamento.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.subconta.deleteMany();
  await prisma.carteira.deleteMany();
  await prisma.pessoa.deleteMany();

  const marcus = await prisma.pessoa.create({
    data: {
      nome: "Marcus",
      ativa: true
    }
  });

  const maju = await prisma.pessoa.create({
    data: {
      nome: "Maju",
      ativa: true
    }
  });

  const nubank = await prisma.carteira.create({
    data: {
      nome: "Nubank",
      tipo: "banco",
      ativa: true
    }
  });

  const pluxee = await prisma.carteira.create({
    data: {
      nome: "Pluxee",
      tipo: "beneficio",
      ativa: true
    }
  });

  const xp = await prisma.carteira.create({
    data: {
      nome: "XP",
      tipo: "corretora",
      ativa: true
    }
  });

  const contaSalario = await prisma.subconta.create({
    data: {
      nome: "Conta Salario",
      tipo: "livre",
      carteira_id: nubank.id,
      ativa: true
    }
  });

  const caixinha1 = await prisma.subconta.create({
    data: {
      nome: "Caixinha 1",
      tipo: "investimento",
      carteira_id: nubank.id,
      ativa: true
    }
  });

  const alimentacao = await prisma.subconta.create({
    data: {
      nome: "Alimentacao",
      tipo: "restrita",
      carteira_id: pluxee.id,
      ativa: true
    }
  });

  const refeicao = await prisma.subconta.create({
    data: {
      nome: "Refeicao",
      tipo: "restrita",
      carteira_id: pluxee.id,
      ativa: true
    }
  });

  const investimentos = await prisma.subconta.create({
    data: {
      nome: "Investimentos",
      tipo: "investimento",
      carteira_id: xp.id,
      ativa: true
    }
  });

  const salario = await prisma.categoria.create({
    data: {
      nome: "Salario",
      tipo: "entrada",
      grupo: "Outros",
      ativa: true,
      casa: false,
      subconta_id: contaSalario.id,
      embutido: false
    }
  });

  const aluguel = await prisma.categoria.create({
    data: {
      nome: "Aluguel",
      tipo: "saida",
      grupo: "Essenciais",
      ativa: true,
      casa: true,
      subconta_id: contaSalario.id,
      embutido: false
    }
  });

  const fatura = await prisma.categoria.create({
    data: {
      nome: "Fatura",
      tipo: "saida",
      grupo: "Cartao",
      ativa: true,
      casa: true,
      subconta_id: contaSalario.id,
      embutido: false
    }
  });

  const mercado = await prisma.categoria.create({
    data: {
      nome: "Mercado",
      tipo: "saida",
      grupo: "Essenciais",
      ativa: true,
      casa: true,
      subconta_id: alimentacao.id,
      embutido: false
    }
  });

  const ifood = await prisma.categoria.create({
    data: {
      nome: "Ifood",
      tipo: "saida",
      grupo: "Conforto",
      ativa: true,
      casa: false,
      subconta_id: refeicao.id,
      embutido: false
    }
  });

  const debitos = await prisma.categoria.create({
    data: {
      nome: "Debitos",
      tipo: "saida",
      grupo: "Outros",
      ativa: true,
      casa: false,
      subconta_id: contaSalario.id,
      embutido: false
    }
  });

  const chatgpt = await prisma.categoria.create({
    data: {
      nome: "ChatGPT",
      tipo: "saida",
      grupo: "Conforto",
      ativa: true,
      casa: false,
      subconta_id: contaSalario.id,
      embutido: true
    }
  });

  const netflix = await prisma.categoria.create({
    data: {
      nome: "Netflix",
      tipo: "saida",
      grupo: "Conforto",
      ativa: true,
      casa: false,
      subconta_id: contaSalario.id,
      embutido: true
    }
  });

  const outros = await prisma.categoria.create({
    data: {
      nome: "Outros",
      tipo: "saida",
      grupo: "Outros",
      ativa: true,
      casa: false,
      subconta_id: contaSalario.id,
      embutido: true
    }
  });

  const luz = await prisma.categoria.create({
    data: {
      nome: "Luz",
      tipo: "saida",
      grupo: "Essenciais",
      ativa: true,
      casa: true,
      subconta_id: contaSalario.id,
      embutido: false
    }
  });

  const investimento = await prisma.categoria.create({
    data: {
      nome: "Investimento",
      tipo: "saida",
      grupo: "Investimentos",
      ativa: true,
      casa: false,
      subconta_id: caixinha1.id,
      embutido: false
    }
  });

  await prisma.categoriaSubconta.createMany({
    data: [
      { categoria_id: mercado.id, subconta_id: alimentacao.id },
      { categoria_id: ifood.id, subconta_id: refeicao.id },
      { categoria_id: investimento.id, subconta_id: caixinha1.id },
      { categoria_id: investimento.id, subconta_id: investimentos.id }
    ]
  });

  const templateAluguel = await prisma.templateLancamento.create({
    data: {
      nome: "Aluguel",
      categoria_id: aluguel.id,
      pessoa_id: null,
      ativo: true,
      frequencia: "mensal",
      tipo_geracao: "fixo",
      dia_fixo: 5,
      tem_valor_fixo: true,
      valor_padrao: 1850,
      gera_lancamento: true
    }
  });

  const templateFatura = await prisma.templateLancamento.create({
    data: {
      nome: "Fatura",
      categoria_id: fatura.id,
      pessoa_id: marcus.id,
      ativo: true,
      frequencia: "mensal",
      tipo_geracao: "variavel_com_data",
      dia_fixo: 10,
      tem_valor_fixo: false,
      valor_padrao: null,
      gera_lancamento: true
    }
  });

  const templateMercado = await prisma.templateLancamento.create({
    data: {
      nome: "Mercado",
      categoria_id: mercado.id,
      pessoa_id: marcus.id,
      ativo: true,
      frequencia: "mensal",
      tipo_geracao: "acumulador",
      dia_fixo: null,
      tem_valor_fixo: false,
      valor_padrao: null,
      gera_lancamento: true
    }
  });

  const templateIfood = await prisma.templateLancamento.create({
    data: {
      nome: "Ifood",
      categoria_id: ifood.id,
      pessoa_id: maju.id,
      ativo: true,
      frequencia: "mensal",
      tipo_geracao: "acumulador",
      dia_fixo: null,
      tem_valor_fixo: false,
      valor_padrao: null,
      gera_lancamento: true
    }
  });

  const templateDebitos = await prisma.templateLancamento.create({
    data: {
      nome: "Debitos",
      categoria_id: debitos.id,
      pessoa_id: null,
      ativo: true,
      frequencia: "mensal",
      tipo_geracao: "acumulador",
      dia_fixo: null,
      tem_valor_fixo: false,
      valor_padrao: null,
      gera_lancamento: true
    }
  });

  await prisma.templateLancamento.create({
    data: {
      nome: "ChatGPT",
      categoria_id: chatgpt.id,
      pessoa_id: marcus.id,
      ativo: true,
      frequencia: "mensal",
      tipo_geracao: "embutido",
      dia_fixo: null,
      tem_valor_fixo: true,
      valor_padrao: 119.9,
      gera_lancamento: false
    }
  });

  await prisma.templateLancamento.create({
    data: {
      nome: "Netflix",
      categoria_id: netflix.id,
      pessoa_id: marcus.id,
      ativo: true,
      frequencia: "mensal",
      tipo_geracao: "embutido",
      dia_fixo: null,
      tem_valor_fixo: true,
      valor_padrao: 39.9,
      gera_lancamento: false
    }
  });

  await prisma.itemTemplate.createMany({
    data: [
      {
        template_pai_id: templateFatura.id,
        categoria_id: chatgpt.id,
        tem_valor_fixo: true,
        valor_padrao: 119.9,
        dia_fixo: null
      },
      {
        template_pai_id: templateFatura.id,
        categoria_id: netflix.id,
        tem_valor_fixo: true,
        valor_padrao: 39.9,
        dia_fixo: null
      },
      {
        template_pai_id: templateFatura.id,
        categoria_id: outros.id,
        tem_valor_fixo: false,
        valor_padrao: null,
        dia_fixo: null
      }
    ]
  });

  await prisma.lancamento.createMany({
    data: [
      {
        data: new Date("2026-03-05"),
        mes: 3,
        ano: 2026,
        template_lancamento_id: null,
        valor: 8500,
        tipo: "entrada",
        status: "pago",
        data_pagamento: new Date("2026-03-05T09:00:00.000Z"),
        pessoa_id: marcus.id,
        casa: false,
        categoria_id: salario.id,
        subconta_id: contaSalario.id,
        descricao: "Salario de Marcus"
      },
      {
        data: new Date("2026-03-05"),
        mes: 3,
        ano: 2026,
        template_lancamento_id: templateAluguel.id,
        valor: 1850,
        tipo: "saida",
        status: "pago",
        data_pagamento: new Date("2026-03-05T12:00:00.000Z"),
        pessoa_id: marcus.id,
        casa: true,
        categoria_id: aluguel.id,
        subconta_id: contaSalario.id,
        descricao: "Aluguel gerado do template"
      },
      {
        data: new Date("2026-03-08"),
        mes: 3,
        ano: 2026,
        template_lancamento_id: templateMercado.id,
        valor: 420.5,
        tipo: "saida",
        status: "pago",
        data_pagamento: new Date("2026-03-08T18:00:00.000Z"),
        pessoa_id: marcus.id,
        casa: true,
        categoria_id: mercado.id,
        subconta_id: alimentacao.id,
        descricao: "Mercado vindo do template"
      },
      {
        data: new Date("2026-03-10"),
        mes: 3,
        ano: 2026,
        template_lancamento_id: templateFatura.id,
        valor: 359.8,
        tipo: "saida",
        status: "nao_pago",
        data_pagamento: null,
        pessoa_id: marcus.id,
        casa: true,
        categoria_id: fatura.id,
        subconta_id: contaSalario.id,
        descricao: "Fatura gerada do template"
      },
      {
        data: new Date("2026-03-08"),
        mes: 3,
        ano: 2026,
        template_lancamento_id: templateIfood.id,
        valor: 68.9,
        tipo: "saida",
        status: "pago",
        data_pagamento: new Date("2026-03-08T20:00:00.000Z"),
        pessoa_id: maju.id,
        casa: false,
        categoria_id: ifood.id,
        subconta_id: refeicao.id,
        descricao: "Ifood vindo do template"
      },
      {
        data: new Date("2026-03-12"),
        mes: 3,
        ano: 2026,
        template_lancamento_id: null,
        valor: 32.5,
        tipo: "saida",
        status: "nao_pago",
        data_pagamento: null,
        pessoa_id: maju.id,
        casa: false,
        categoria_id: ifood.id,
        subconta_id: refeicao.id,
        descricao: "Cafe manual sem template"
      },
      {
        data: new Date("2026-03-15"),
        mes: 3,
        ano: 2026,
        template_lancamento_id: null,
        valor: 210.33,
        tipo: "saida",
        status: "pago",
        data_pagamento: new Date("2026-03-15T10:00:00.000Z"),
        pessoa_id: marcus.id,
        casa: true,
        categoria_id: luz.id,
        subconta_id: contaSalario.id,
        descricao: "Luz da casa"
      },
      {
        data: new Date("2026-03-20"),
        mes: 3,
        ano: 2026,
        template_lancamento_id: null,
        valor: 1000,
        tipo: "saida",
        status: "nao_pago",
        data_pagamento: null,
        pessoa_id: marcus.id,
        casa: false,
        categoria_id: investimento.id,
        subconta_id: caixinha1.id,
        descricao: "Aporte planejado"
      }
    ]
  });

  await prisma.transferencia.createMany({
    data: [
      {
        data: new Date("2026-03-21"),
        mes: 3,
        ano: 2026,
        valor: 1000,
        status: "planejada",
        data_realizacao: null,
        subconta_origem_id: contaSalario.id,
        subconta_destino_id: caixinha1.id,
        descricao: "Reserva planejada"
      },
      {
        data: new Date("2026-03-25"),
        mes: 3,
        ano: 2026,
        valor: 500,
        status: "realizada",
        data_realizacao: new Date("2026-03-25T14:00:00.000Z"),
        subconta_origem_id: contaSalario.id,
        subconta_destino_id: investimentos.id,
        descricao: "Transferencia para corretora"
      }
    ]
  });

  void templateAluguel;
  void templateMercado;
  void templateIfood;
  void templateDebitos;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
