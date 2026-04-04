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
      grupo: "ganho",
      ativa: true,
      eh_embutida: false
    }
  });

  const aluguel = await prisma.categoria.create({
    data: {
      nome: "Aluguel",
      tipo: "saida",
      grupo: "fixo",
      ativa: true,
      eh_embutida: false
    }
  });

  const fatura = await prisma.categoria.create({
    data: {
      nome: "Fatura",
      tipo: "saida",
      grupo: "cartao",
      ativa: true,
      eh_embutida: false
    }
  });

  const mercado = await prisma.categoria.create({
    data: {
      nome: "Mercado",
      tipo: "saida",
      grupo: "essencial",
      ativa: true,
      eh_embutida: false
    }
  });

  const ifood = await prisma.categoria.create({
    data: {
      nome: "Ifood",
      tipo: "saida",
      grupo: "conforto",
      ativa: true,
      eh_embutida: false
    }
  });

  const debitos = await prisma.categoria.create({
    data: {
      nome: "Debitos",
      tipo: "saida",
      grupo: "variavel",
      ativa: true,
      eh_embutida: false
    }
  });

  const chatgpt = await prisma.categoria.create({
    data: {
      nome: "ChatGPT",
      tipo: "saida",
      grupo: "assinatura",
      ativa: true,
      eh_embutida: true
    }
  });

  const netflix = await prisma.categoria.create({
    data: {
      nome: "Netflix",
      tipo: "saida",
      grupo: "assinatura",
      ativa: true,
      eh_embutida: true
    }
  });

  const outros = await prisma.categoria.create({
    data: {
      nome: "Outros",
      tipo: "saida",
      grupo: "composicao",
      ativa: true,
      eh_embutida: true
    }
  });

  const luz = await prisma.categoria.create({
    data: {
      nome: "Luz",
      tipo: "saida",
      grupo: "fixo",
      ativa: true,
      eh_embutida: false
    }
  });

  const investimento = await prisma.categoria.create({
    data: {
      nome: "Investimento",
      tipo: "saida",
      grupo: "investimento",
      ativa: true,
      eh_embutida: false
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
        pessoa_id: marcus.id,
        eh_casa: false,
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
        pessoa_id: marcus.id,
        eh_casa: true,
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
        pessoa_id: marcus.id,
        eh_casa: true,
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
        pessoa_id: marcus.id,
        eh_casa: true,
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
        pessoa_id: maju.id,
        eh_casa: false,
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
        pessoa_id: maju.id,
        eh_casa: false,
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
        pessoa_id: marcus.id,
        eh_casa: true,
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
        pessoa_id: marcus.id,
        eh_casa: false,
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
        subconta_origem_id: contaSalario.id,
        subconta_destino_id: caixinha1.id,
        descricao: "Reserva mensal"
      },
      {
        data: new Date("2026-03-25"),
        mes: 3,
        ano: 2026,
        valor: 500,
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
