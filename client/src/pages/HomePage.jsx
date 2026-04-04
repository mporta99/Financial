import { useEffect, useState } from "react";
import HomeNavCard from "../components/HomeNavCard";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
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
  { title: "Movimentar Dinheiro", description: "Estrutura visual com cards arrastaveis.", to: "/movimentar-dinheiro" }
];

export default function HomePage() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getDashboardSummary().then(setSummary).catch(() => {
      setSummary(null);
    });
  }, []);

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

      <div className="home-nav-grid">
        {navigationCards.map((card) => (
          <HomeNavCard key={card.to} {...card} />
        ))}
      </div>
    </section>
  );
}
