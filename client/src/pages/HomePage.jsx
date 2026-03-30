import { useEffect, useState } from "react";
import HomeNavCard from "../components/HomeNavCard";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { getDashboardSummary } from "../services/api/dashboard";
import "./HomePage.css";

const navigationCards = [
  { title: "Carteiras", description: "Gerencie agrupadores principais.", to: "/carteiras" },
  { title: "Subcontas", description: "Organize onde o dinheiro fica.", to: "/subcontas" },
  { title: "Categorias", description: "Classifique entradas e saídas.", to: "/categorias" },
  { title: "Lançamentos", description: "Cadastre movimentações reais.", to: "/lancamentos" },
  { title: "Transferências", description: "Movimente valores entre subcontas.", to: "/transferencias" },
  { title: "Movimentar Dinheiro", description: "Estrutura visual com cards arrastáveis.", to: "/movimentar-dinheiro" }
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
        description="Uma entrada simples para navegar pelos módulos principais do app financeiro e acompanhar a base já conectada ao backend."
      />

      <div className="stats-grid">
        <StatCard label="Carteiras" value={summary?.carteiras ?? "-"} />
        <StatCard label="Subcontas" value={summary?.subcontas ?? "-"} />
        <StatCard label="Lançamentos" value={summary?.lancamentos ?? "-"} />
        <StatCard label="Transferências" value={summary?.transferencias ?? "-"} />
      </div>

      <div className="home-nav-grid">
        {navigationCards.map((card) => (
          <HomeNavCard key={card.to} {...card} />
        ))}
      </div>
    </section>
  );
}
