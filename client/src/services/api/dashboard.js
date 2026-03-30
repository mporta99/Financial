import { getResourceList } from "./resources";

async function getDashboardSummary() {
  const [carteiras, subcontas, lancamentos, transferencias] = await Promise.all([
    getResourceList("carteiras"),
    getResourceList("subcontas"),
    getResourceList("lancamentos"),
    getResourceList("transferencias")
  ]);

  return {
    carteiras: carteiras.length,
    subcontas: subcontas.length,
    lancamentos: lancamentos.length,
    transferencias: transferencias.length
  };
}

async function getMovementData() {
  const [carteiras, subcontas, lancamentos, transferencias] = await Promise.all([
    getResourceList("carteiras"),
    getResourceList("subcontas"),
    getResourceList("lancamentos"),
    getResourceList("transferencias")
  ]);

  return {
    carteiras,
    subcontas,
    lancamentos,
    transferencias
  };
}

export { getDashboardSummary, getMovementData };
