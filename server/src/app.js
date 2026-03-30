const { router } = require("./routes");

function app(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/api/health") {
    res.writeHead(200);
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  router(req, res);
}

module.exports = { app };
