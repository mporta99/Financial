const { createLancamento, deleteLancamento, listLancamentos, patchLancamento, updateLancamento } = require("../controllers/lancamentos.controller");
const { readJsonBody } = require("../utils/read-json-body");
const { sendJson } = require("../utils/send-json");

async function handleLancamentosRoutes(req, res) {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET") {
    const data = await listLancamentos({
      mes: url.searchParams.get("mes") ?? undefined,
      ano: url.searchParams.get("ano") ?? undefined
    });
    sendJson(res, 200, data);
    return;
  }

  if (req.method === "POST") {
    const payload = await readJsonBody(req);
    const data = await createLancamento(payload);
    sendJson(res, 201, data);
    return;
  }

  if (req.method === "PUT") {
    const payload = await readJsonBody(req);
    const data = await updateLancamento(req.params.id, payload);
    sendJson(res, 200, data);
    return;
  }

  if (req.method === "PATCH") {
    const payload = await readJsonBody(req);
    const data = await patchLancamento(req.params.id, payload);
    sendJson(res, 200, data);
    return;
  }

  if (req.method === "DELETE") {
    const data = await deleteLancamento(req.params.id);
    sendJson(res, 200, data);
    return;
  }

  sendJson(res, 405, { message: "Method not allowed" });
}

module.exports = { handleLancamentosRoutes };
