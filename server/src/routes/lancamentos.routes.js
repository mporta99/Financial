const { listLancamentos } = require("../controllers/lancamentos.controller");
const { sendJson } = require("../utils/send-json");

async function handleLancamentosRoutes(_req, res) {
  const data = await listLancamentos();
  sendJson(res, 200, data);
}

module.exports = { handleLancamentosRoutes };
