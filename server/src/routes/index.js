const { handleTransactionsRoutes } = require("./transactions.routes");

function router(req, res) {
  if (req.url === "/api/transactions" && req.method === "GET") {
    handleTransactionsRoutes(req, res);
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ message: "Route not found" }));
}

module.exports = { router };
