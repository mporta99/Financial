const { listCarteiras } = require("../controllers/carteiras.controller");
const { sendJson } = require("../utils/send-json");

async function handleCarteirasRoutes(_req, res) {
  const data = await listCarteiras();
  sendJson(res, 200, data);
}

module.exports = { handleCarteirasRoutes };
