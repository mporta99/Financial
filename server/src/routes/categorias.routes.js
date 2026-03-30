const { listCategorias } = require("../controllers/categorias.controller");
const { sendJson } = require("../utils/send-json");

async function handleCategoriasRoutes(_req, res) {
  const data = await listCategorias();
  sendJson(res, 200, data);
}

module.exports = { handleCategoriasRoutes };
