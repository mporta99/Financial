const { router } = require("./routes");
const { sendJson } = require("./utils/send-json");

async function app(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/api/health") {
    sendJson(res, 200, { status: "ok" });
    return;
  }

  try {
    await router(req, res);
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { message: "Internal server error" });
  }
}

module.exports = { app };
