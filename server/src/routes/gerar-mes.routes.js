const { gerarMes } = require("../controllers/gerar-mes.controller");
const { readJsonBody } = require("../utils/read-json-body");
const { sendJson } = require("../utils/send-json");

async function handleGerarMesRoutes(req, res) {
  if (req.method === "POST") {
    const payload = await readJsonBody(req);
    const data = await gerarMes(payload);
    sendJson(res, 201, data);
    return;
  }

  sendJson(res, 405, { message: "Method not allowed" });
}

module.exports = { handleGerarMesRoutes };
