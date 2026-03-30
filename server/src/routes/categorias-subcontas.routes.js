const { createCategoriaSubconta, listCategoriasSubcontas } = require("../controllers/categorias-subcontas.controller");
const { readJsonBody } = require("../utils/read-json-body");
const { sendJson } = require("../utils/send-json");

async function handleCategoriasSubcontasRoutes(req, res) {
  if (req.method === "GET") {
    const data = await listCategoriasSubcontas();
    sendJson(res, 200, data);
    return;
  }

  if (req.method === "POST") {
    const payload = await readJsonBody(req);
    const data = await createCategoriaSubconta(payload);
    sendJson(res, 201, data);
    return;
  }

  sendJson(res, 405, { message: "Method not allowed" });
}

module.exports = { handleCategoriasSubcontasRoutes };
