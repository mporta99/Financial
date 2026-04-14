import { useEffect, useState } from "react";
import HomeNavCard from "../components/HomeNavCard";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { formatCurrency, formatDate } from "../services/formatters";
import { getDashboardSummary } from "../services/api/dashboard";
import "./HomePage.css";

const navigationCards = [
  { title: "Pessoas", description: "Defina de quem e cada lancamento.", to: "/pessoas" },
  { title: "Carteiras", description: "Gerencie agrupadores principais.", to: "/carteiras" },
  { title: "Subcontas", description: "Organize onde o dinheiro fica.", to: "/subcontas" },
  { title: "Categorias", description: "Classifique entradas, saidas e embutidos.", to: "/categorias" },
  { title: "Templates", description: "Defina moldes mensais de lancamento.", to: "/templates-lancamento" },
  { title: "Itens Template", description: "Componha templates principais por itens.", to: "/itens-template" },
  { title: "Lancamentos", description: "Cadastre movimentacoes reais.", to: "/lancamentos" },
  { title: "Transferencias", description: "Movimente valores entre subcontas.", to: "/transferencias" },
  { title: "Movimentar Dinheiro", description: "Estrutura visual com cards arrastaveis.", to: "/movimentar-dinheiro" },
  { title: "Gerar Mes", description: "Crie lancamentos mensais a partir dos templates.", to: "/gerar-mes" }
];

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function getFirstWord(value) {
  return String(value ?? "").trim().split(/\s+/)[0] ?? "";
}

function getMarcusCurrentCompetencia() {
  const today = new Date();
  const day = today.getDate();
  const competencia = new Date(today);

  if (day >= 25) {
    competencia.setMonth(competencia.getMonth() + 1);
  }

  return {
    mes: competencia.getMonth() + 1,
    ano: competencia.getFullYear()
  };
}

function ContaBox({ kicker, title, acm, planAcm, totalPagar, payables, faturado = null }) {
  return (
    <article className="caixa-card">
      <header className="caixa-card-header">
        <div className="caixa-card-title">
          <span className="caixa-card-kicker">{kicker}</span>
          <strong className="caixa-card-name">{title}</strong>
        </div>
        <div className="caixa-card-metrics">
          <span><strong>{formatCurrency(acm ?? 0)}</strong></span>
          {planAcm != null ? <span><strong>{formatCurrency(planAcm)}</strong></span> : null}
        </div>
      </header>

      <div className="caixa-payables-header">
        <strong className="caixa-payables-label">Pagar</strong>
        <strong className="caixa-payables-total">{formatCurrency(totalPagar ?? 0)}</strong>
      </div>

      <div className="caixa-payables-list">
        {faturado ? (
          <div className="caixa-fatura-box">
            <div className="caixa-fatura-header">
              <strong className="caixa-fatura-label">Fatura</strong>
              <strong className="caixa-fatura-total">{formatCurrency(faturado.valorPlanejado)}</strong>
            </div>

            <div className="caixa-fatura-list">
              {faturado.itens.map((item) => (
                <article key={item.id} className="caixa-line-row caixa-line-row-fatura">
                  <strong className="caixa-line-name">{getFirstWord(item.descricao)}</strong>
                  <span className="caixa-line-meta">{formatDate(item.data)}</span>
                  <strong className="caixa-line-value">{formatCurrency(item.valor)}</strong>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {payables?.length ? (
          payables.map((item) => (
            <article key={item.id} className="caixa-line-row">
              <strong className="caixa-line-name">{item.descricao}</strong>
              <span className="caixa-line-meta">{formatDate(item.data)}</span>
              <strong className="caixa-line-value">{formatCurrency(item.valor)}</strong>
            </article>
          ))
        ) : (
          <div className="caixa-empty">Sem contas a pagar.</div>
        )}
      </div>
    </article>
  );
}

export default function HomePage() {
  const [summary, setSummary] = useState(null);
  const [competencia, setCompetencia] = useState(() => getMarcusCurrentCompetencia());

  useEffect(() => {
    getDashboardSummary(competencia).then(setSummary).catch(() => {
      setSummary(null);
    });
  }, [competencia.ano, competencia.mes]);

  const totalPagarSalario =
    (summary?.nubankSalarioContasPagar?.reduce((total, item) => total + Number(item.valor), 0) ?? 0) +
    Number(summary?.nubankSalarioFatura?.valorPlanejado ?? 0);
  const totalPagarCiacard = summary?.ciacardContasPagar?.reduce((total, item) => total + Number(item.valor), 0) ?? 0;
  const totalPagarPluxeeAlimentacao =
    summary?.pluxeeAlimentacaoContasPagar?.reduce((total, item) => total + Number(item.valor), 0) ?? 0;
  const totalPagarPluxeeRefeicao =
    summary?.pluxeeRefeicaoContasPagar?.reduce((total, item) => total + Number(item.valor), 0) ?? 0;
  const competenciaLabel = `${String(competencia.mes).padStart(2, "0")}/${competencia.ano}`;
  const investimentosSaldoAcm =
    summary?.investimentosBoxes?.reduce((total, grupo) => total + Number(grupo.saldoAcm ?? 0), 0) ?? 0;
  const investimentosPlanAcm =
    summary?.investimentosBoxes?.reduce((total, grupo) => total + Number(grupo.planAcm ?? 0), 0) ?? 0;

  return (
    <section className="home-layout">
      <PageHeader
        title="Home"
        description="Uma entrada simples para navegar pelos modulos principais do app financeiro e acompanhar a base ja conectada ao backend."
      />

      <div className="stats-grid">
        <StatCard label="Pessoas" value={summary?.pessoas ?? "-"} />
        <StatCard label="Carteiras" value={summary?.carteiras ?? "-"} />
        <StatCard label="Subcontas" value={summary?.subcontas ?? "-"} />
        <StatCard label="Templates" value={summary?.templatesLancamento ?? "-"} />
        <StatCard label="Lancamentos" value={summary?.lancamentos ?? "-"} />
        <StatCard label="Transferencias" value={summary?.transferencias ?? "-"} />
      </div>

      <section className="caixa-section">
        <header className="caixa-section-header">
          <div className="caixa-section-heading">
            <span className="caixa-section-kicker">Painel</span>
            <div className="caixa-section-title-row">
              <h3>Caixa</h3>
              <span className="caixa-section-competencia">{competenciaLabel}</span>
            </div>
          </div>

          <div className="caixa-filters">
            <select
              aria-label="Ano"
              value={competencia.ano}
              onChange={(event) =>
                setCompetencia((current) => ({
                  ...current,
                  ano: Number(event.target.value)
                }))
              }
            >
              {(summary?.anosDisponiveis?.length ? summary.anosDisponiveis : [competencia.ano]).map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>

            <select
              aria-label="Mes"
              value={competencia.mes}
              onChange={(event) =>
                setCompetencia((current) => ({
                  ...current,
                  mes: Number(event.target.value)
                }))
              }
            >
              {MONTH_LABELS.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </header>

        <div className="caixa-grid">
          <div className="caixa-main-column">
            <article className="caixa-card caixa-card-salario">
              <header className="caixa-card-header">
                <div className="caixa-card-title">
                  <span className="caixa-card-kicker">Caixa</span>
                  <strong className="caixa-card-name">Salario</strong>
                </div>
                <div className="caixa-card-metrics">
                  <span>
                    <strong>{formatCurrency((summary?.nubankSalarioBox?.saldoAcm ?? 0) + (summary?.ciacardBox?.saldoAcm ?? 0))}</strong>
                  </span>
                  <span>
                    <strong>{formatCurrency((summary?.nubankSalarioBox?.planAcm ?? 0) + (summary?.ciacardBox?.planAcm ?? 0))}</strong>
                  </span>
                </div>
              </header>

              <div className="caixa-salario-groups">
                <ContaBox
                  kicker="Nubank"
                  title="Conta Salario"
                  acm={summary?.nubankSalarioBox?.saldoAcm}
                  planAcm={summary?.nubankSalarioBox?.planAcm}
                  totalPagar={totalPagarSalario}
                  payables={summary?.nubankSalarioContasPagar}
                  faturado={summary?.nubankSalarioFatura}
                />

                <ContaBox
                  kicker="Ciacard"
                  title="Ciacard"
                  acm={summary?.ciacardBox?.saldoAcm}
                  planAcm={summary?.ciacardBox?.planAcm}
                  totalPagar={totalPagarCiacard}
                  payables={summary?.ciacardContasPagar}
                />
              </div>
            </article>
          </div>

          <div className="caixa-side-column">
            <article className="caixa-card caixa-card-pluxee">
              <header className="caixa-card-header">
                <div className="caixa-card-title">
                  <span className="caixa-card-kicker">Caixa</span>
                  <strong className="caixa-card-name">Pluxee</strong>
                </div>
                <div className="caixa-card-metrics">
                  <span>
                    <strong>{formatCurrency((summary?.pluxeeAlimentacaoBox?.saldoAcm ?? 0) + (summary?.pluxeeRefeicaoBox?.saldoAcm ?? 0))}</strong>
                  </span>
                  <span>
                    <strong>{formatCurrency((summary?.pluxeeAlimentacaoBox?.planAcm ?? 0) + (summary?.pluxeeRefeicaoBox?.planAcm ?? 0))}</strong>
                  </span>
                </div>
              </header>

              <div className="caixa-pluxee-grid">
                <ContaBox
                  kicker="Pluxee"
                  title="Alimentacao"
                  acm={summary?.pluxeeAlimentacaoBox?.saldoAcm}
                  planAcm={summary?.pluxeeAlimentacaoBox?.planAcm}
                  totalPagar={totalPagarPluxeeAlimentacao}
                  payables={summary?.pluxeeAlimentacaoContasPagar}
                />

                <ContaBox
                  kicker="Pluxee"
                  title="Refeicao"
                  acm={summary?.pluxeeRefeicaoBox?.saldoAcm}
                  planAcm={summary?.pluxeeRefeicaoBox?.planAcm}
                  totalPagar={totalPagarPluxeeRefeicao}
                  payables={summary?.pluxeeRefeicaoContasPagar}
                />
              </div>
            </article>

            {summary?.investimentosBoxes?.length ? (
              <article className="caixa-card caixa-card-investimentos">
                <header className="caixa-card-header">
                  <div className="caixa-card-title">
                    <strong className="caixa-card-name">Investimentos</strong>
                  </div>
                  <div className="caixa-card-metrics">
                    <span><strong>{formatCurrency(investimentosSaldoAcm)}</strong></span>
                    <span><strong>{formatCurrency(investimentosPlanAcm)}</strong></span>
                  </div>
                </header>

                <div className="caixa-investment-groups">
                  {summary.investimentosBoxes.map((grupo) => (
                    <article key={grupo.carteiraNome} className="caixa-investment-group-card">
                      <header className="caixa-investment-group-header">
                        <div className="caixa-card-title">
                          <strong className="caixa-card-name">{grupo.carteiraNome}</strong>
                        </div>
                        <div className="caixa-card-metrics">
                          <span><strong>{formatCurrency(grupo.saldoAcm ?? 0)}</strong></span>
                          <span><strong>{formatCurrency(grupo.planAcm ?? 0)}</strong></span>
                        </div>
                      </header>

                      <div className="caixa-investment-grid">
                        {grupo.itens?.map((item) => (
                          <article key={item.id} className="caixa-investment-card">
                            <strong className="caixa-investment-name">{item.subcontaNome}</strong>
                            <div className="caixa-investment-values">
                              <span>{formatCurrency(item.saldoAcm)}</span>
                            </div>
                          </article>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </article>
            ) : null}
          </div>
        </div>
      </section>

      <div className="home-nav-grid">
        {navigationCards.map((card) => (
          <HomeNavCard key={card.to} {...card} />
        ))}
      </div>
    </section>
  );
}
