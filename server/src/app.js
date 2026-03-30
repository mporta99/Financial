const { router } = require("./routes");
const { HttpError } = require("./utils/http-error");
const { sendJson } = require("./utils/send-json");

async function app(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === "/api/health") {
    sendJson(res, 200, { status: "ok" });
    return;
  }

  try {
    await router(req, res);
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(res, error.statusCode, { message: error.message });
      return;
    }

    if (error && error.code === "P2002") {
      sendJson(res, 409, { message: "Unique constraint violation" });
      return;
    }

    if (error && error.code === "P2003") {
      sendJson(res, 400, { message: "Invalid related record reference" });
      return;
    }

    console.error(error);
    sendJson(res, 500, { message: "Internal server error" });
  }
}

module.exports = { app };
