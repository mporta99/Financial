const { listCategoriasSubcontas } = require("../controllers/categorias-subcontas.controller");
const { sendJson } = require("../utils/send-json");

async function handleCategoriasSubcontasRoutes(_req, res) {
  const data = await listCategoriasSubcontas();
  sendJson(res, 200, data);
}

module.exports = { handleCategoriasSubcontasRoutes };
