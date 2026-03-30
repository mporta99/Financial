const { handleCarteirasRoutes } = require("./carteiras.routes");
const { handleCategoriasRoutes } = require("./categorias.routes");
const { handleCategoriasSubcontasRoutes } = require("./categorias-subcontas.routes");
const { handleLancamentosRoutes } = require("./lancamentos.routes");
const { handleSubcontasRoutes } = require("./subcontas.routes");
const { handleTransferenciasRoutes } = require("./transferencias.routes");
const { sendJson } = require("../utils/send-json");

async function router(req, res) {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/carteiras" && req.method === "GET") {
    await handleCarteirasRoutes(req, res);
    return;
  }

  if (url.pathname === "/api/subcontas" && req.method === "GET") {
    await handleSubcontasRoutes(req, res);
    return;
  }

  if (url.pathname === "/api/categorias" && req.method === "GET") {
    await handleCategoriasRoutes(req, res);
    return;
  }

  if (url.pathname === "/api/lancamentos" && req.method === "GET") {
    await handleLancamentosRoutes(req, res);
    return;
  }

  if (url.pathname === "/api/transferencias" && req.method === "GET") {
    await handleTransferenciasRoutes(req, res);
    return;
  }

  if (url.pathname === "/api/categorias-subcontas" && req.method === "GET") {
    await handleCategoriasSubcontasRoutes(req, res);
    return;
  }

  sendJson(res, 404, { message: "Route not found" });
}

module.exports = { router };
