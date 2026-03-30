const { listTransferencias } = require("../controllers/transferencias.controller");
const { sendJson } = require("../utils/send-json");

async function handleTransferenciasRoutes(_req, res) {
  const data = await listTransferencias();
  sendJson(res, 200, data);
}

module.exports = { handleTransferenciasRoutes };
