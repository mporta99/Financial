import { useEffect, useState } from "react";
import MovementBoard from "../components/MovementBoard";
import PageHeader from "../components/PageHeader";
import { getMovementData } from "../services/api/dashboard";
import "./MovimentarDinheiroPage.css";

export default function MovimentarDinheiroPage() {
  const [data, setData] = useState({
    carteiras: [],
    subcontas: [],
    lancamentos: [],
    transferencias: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const response = await getMovementData();
        setData(response);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <section className="movement-page">
      <PageHeader
        title="Movimentar Dinheiro"
        description="Estrutura visual das carteiras com subcontas e lançamentos arrastáveis. Nesta fase, a distribuição dos cards é simulada para construir a interface."
      />

      {loading ? <div className="movement-feedback">Carregando movimentações...</div> : null}
      {error ? <div className="movement-feedback movement-feedback-error">{error}</div> : null}

      {!loading && !error ? (
        <MovementBoard
          carteiras={data.carteiras}
          subcontas={data.subcontas}
          lancamentos={data.lancamentos}
          transferencias={data.transferencias}
        />
      ) : null}
    </section>
  );
}
