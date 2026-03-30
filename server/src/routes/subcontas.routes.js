const { listSubcontas } = require("../controllers/subcontas.controller");
const { sendJson } = require("../utils/send-json");

async function handleSubcontasRoutes(_req, res) {
  const data = await listSubcontas();
  sendJson(res, 200, data);
}

module.exports = { handleSubcontasRoutes };
