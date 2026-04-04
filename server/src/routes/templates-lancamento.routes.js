const {
  createTemplateLancamento,
  deleteTemplateLancamento,
  listTemplatesLancamento,
  updateTemplateLancamento
} = require("../controllers/templates-lancamento.controller");
const { readJsonBody } = require("../utils/read-json-body");
const { sendJson } = require("../utils/send-json");

async function handleTemplatesLancamentoRoutes(req, res) {
  if (req.method === "GET") {
    const data = await listTemplatesLancamento();
    sendJson(res, 200, data);
    return;
  }

  if (req.method === "POST") {
    const payload = await readJsonBody(req);
    const data = await createTemplateLancamento(payload);
    sendJson(res, 201, data);
    return;
  }

  if (req.method === "PUT") {
    const payload = await readJsonBody(req);
    const data = await updateTemplateLancamento(req.params.id, payload);
    sendJson(res, 200, data);
    return;
  }

  if (req.method === "DELETE") {
    const data = await deleteTemplateLancamento(req.params.id);
    sendJson(res, 200, data);
    return;
  }

  sendJson(res, 405, { message: "Method not allowed" });
}

module.exports = { handleTemplatesLancamentoRoutes };
