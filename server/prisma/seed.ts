import { PrismaClient, TipoCategoria, TipoLancamento, TipoSubconta } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.categoriaSubconta.deleteMany();
  await prisma.transferencia.deleteMany();
  await prisma.lancamento.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.subconta.deleteMany();
  await prisma.carteira.deleteMany();

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
      tipo: TipoSubconta.livre,
      carteira_id: nubank.id,
      ativa: true
    }
  });

  const caixinha1 = await prisma.subconta.create({
    data: {
      nome: "Caixinha 1",
      tipo: TipoSubconta.investimento,
      carteira_id: nubank.id,
      ativa: true
    }
  });

  const alimentacao = await prisma.subconta.create({
    data: {
      nome: "Alimentacao",
      tipo: TipoSubconta.restrita,
      carteira_id: pluxee.id,
      ativa: true
    }
  });

  const refeicao = await prisma.subconta.create({
    data: {
      nome: "Refeicao",
      tipo: TipoSubconta.restrita,
      carteira_id: pluxee.id,
      ativa: true
    }
  });

  const investimentos = await prisma.subconta.create({
    data: {
      nome: "Investimentos",
      tipo: TipoSubconta.investimento,
      carteira_id: xp.id,
      ativa: true
    }
  });

  const salario = await prisma.categoria.create({
    data: {
      nome: "Salario",
      tipo: TipoCategoria.entrada,
      grupo: "ganho",
      ativa: true
    }
  });

  const mercado = await prisma.categoria.create({
    data: {
      nome: "Mercado",
      tipo: TipoCategoria.saida,
      grupo: "essencial",
      ativa: true
    }
  });

  const ifood = await prisma.categoria.create({
    data: {
      nome: "Ifood",
      tipo: TipoCategoria.saida,
      grupo: "conforto",
      ativa: true
    }
  });

  const luz = await prisma.categoria.create({
    data: {
      nome: "Luz",
      tipo: TipoCategoria.saida,
      grupo: "fixo",
      ativa: true
    }
  });

  const investimento = await prisma.categoria.create({
    data: {
      nome: "Investimento",
      tipo: TipoCategoria.saida,
      grupo: "investimento",
      ativa: true
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

  await prisma.lancamento.createMany({
    data: [
      {
        data: new Date("2026-03-05"),
        valor: 8500,
        tipo: TipoLancamento.entrada,
        categoria_id: salario.id,
        subconta_id: contaSalario.id,
        descricao: "Salario mensal"
      },
      {
        data: new Date("2026-03-08"),
        valor: 420.5,
        tipo: TipoLancamento.saida,
        categoria_id: mercado.id,
        subconta_id: alimentacao.id,
        descricao: "Compras do mes no mercado"
      },
      {
        data: new Date("2026-03-11"),
        valor: 68.9,
        tipo: TipoLancamento.saida,
        categoria_id: ifood.id,
        subconta_id: refeicao.id,
        descricao: "Pedido de jantar"
      },
      {
        data: new Date("2026-03-15"),
        valor: 210.33,
        tipo: TipoLancamento.saida,
        categoria_id: luz.id,
        subconta_id: contaSalario.id,
        descricao: "Conta de luz"
      },
      {
        data: new Date("2026-03-20"),
        valor: 1000,
        tipo: TipoLancamento.saida,
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
        valor: 1000,
        subconta_origem_id: contaSalario.id,
        subconta_destino_id: caixinha1.id,
        descricao: "Reserva mensal"
      },
      {
        data: new Date("2026-03-25"),
        valor: 500,
        subconta_origem_id: contaSalario.id,
        subconta_destino_id: investimentos.id,
        descricao: "Transferencia para corretora"
      }
    ]
  });
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
