const { handleCarteirasRoutes } = require("./carteiras.routes");
const { handleCategoriasRoutes } = require("./categorias.routes");
const { handleCategoriasSubcontasRoutes } = require("./categorias-subcontas.routes");
const { handleItensTemplateRoutes } = require("./itens-template.routes");
const { handleLancamentosRoutes } = require("./lancamentos.routes");
const { handlePessoasRoutes } = require("./pessoas.routes");
const { handleSubcontasRoutes } = require("./subcontas.routes");
const { handleTemplatesLancamentoRoutes } = require("./templates-lancamento.routes");
const { handleTransferenciasRoutes } = require("./transferencias.routes");
const { sendJson } = require("../utils/send-json");

async function router(req, res) {
  const url = new URL(req.url, "http://localhost");
  const matchRoute = (pattern) => {
    const match = url.pathname.match(pattern);

    if (!match) {
      return null;
    }

    req.params = match.groups || {};
    return req.params;
  };

  if (matchRoute(/^\/api\/carteiras(?:\/(?<id>\d+))?$/)) {
    await handleCarteirasRoutes(req, res);
    return;
  }

  if (matchRoute(/^\/api\/subcontas(?:\/(?<id>\d+))?$/)) {
    await handleSubcontasRoutes(req, res);
    return;
  }

  if (matchRoute(/^\/api\/categorias(?:\/(?<id>\d+))?$/)) {
    await handleCategoriasRoutes(req, res);
    return;
  }

  if (matchRoute(/^\/api\/pessoas(?:\/(?<id>\d+))?$/)) {
    await handlePessoasRoutes(req, res);
    return;
  }

  if (matchRoute(/^\/api\/lancamentos(?:\/(?<id>\d+))?$/)) {
    await handleLancamentosRoutes(req, res);
    return;
  }

  if (matchRoute(/^\/api\/templates-lancamento(?:\/(?<id>\d+))?$/)) {
    await handleTemplatesLancamentoRoutes(req, res);
    return;
  }

  if (matchRoute(/^\/api\/itens-template(?:\/(?<id>\d+))?$/)) {
    await handleItensTemplateRoutes(req, res);
    return;
  }

  if (matchRoute(/^\/api\/transferencias(?:\/(?<id>\d+))?$/)) {
    await handleTransferenciasRoutes(req, res);
    return;
  }

  if (url.pathname === "/api/categorias-subcontas") {
    await handleCategoriasSubcontasRoutes(req, res);
    return;
  }

  sendJson(res, 404, { message: "Route not found" });
}

module.exports = { router };
