const {
  createItemTemplate,
  deleteItemTemplate,
  listItensTemplate,
  updateItemTemplate
} = require("../controllers/itens-template.controller");
const { readJsonBody } = require("../utils/read-json-body");
const { sendJson } = require("../utils/send-json");

async function handleItensTemplateRoutes(req, res) {
  if (req.method === "GET") {
    const data = await listItensTemplate();
    sendJson(res, 200, data);
    return;
  }

  if (req.method === "POST") {
    const payload = await readJsonBody(req);
    const data = await createItemTemplate(payload);
    sendJson(res, 201, data);
    return;
  }

  if (req.method === "PUT") {
    const payload = await readJsonBody(req);
    const data = await updateItemTemplate(req.params.id, payload);
    sendJson(res, 200, data);
    return;
  }

  if (req.method === "DELETE") {
    const data = await deleteItemTemplate(req.params.id);
    sendJson(res, 200, data);
    return;
  }

  sendJson(res, 405, { message: "Method not allowed" });
}

module.exports = { handleItensTemplateRoutes };
