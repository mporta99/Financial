const { createCategoria, deleteCategoria, listCategorias, updateCategoria } = require("../controllers/categorias.controller");
const { readJsonBody } = require("../utils/read-json-body");
const { sendJson } = require("../utils/send-json");

async function handleCategoriasRoutes(req, res) {
  if (req.method === "GET") {
    const data = await listCategorias();
    sendJson(res, 200, data);
    return;
  }

  if (req.method === "POST") {
    const payload = await readJsonBody(req);
    const data = await createCategoria(payload);
    sendJson(res, 201, data);
    return;
  }

  if (req.method === "PUT") {
    const payload = await readJsonBody(req);
    const data = await updateCategoria(req.params.id, payload);
    sendJson(res, 200, data);
    return;
  }

  if (req.method === "DELETE") {
    const data = await deleteCategoria(req.params.id);
    sendJson(res, 200, data);
    return;
  }

  sendJson(res, 405, { message: "Method not allowed" });
}

module.exports = { handleCategoriasRoutes };
