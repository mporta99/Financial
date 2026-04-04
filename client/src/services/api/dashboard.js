import { getResourceList } from "./resources";

async function getDashboardSummary() {
  const [pessoas, carteiras, subcontas, templatesLancamento, lancamentos, transferencias] = await Promise.all([
    getResourceList("pessoas"),
    getResourceList("carteiras"),
    getResourceList("subcontas"),
    getResourceList("templates-lancamento"),
    getResourceList("lancamentos"),
    getResourceList("transferencias")
  ]);

  return {
    pessoas: pessoas.length,
    carteiras: carteiras.length,
    subcontas: subcontas.length,
    templatesLancamento: templatesLancamento.length,
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
