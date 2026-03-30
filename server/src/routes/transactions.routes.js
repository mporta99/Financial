const { listTransactions } = require("../controllers/transactions.controller");

function handleTransactionsRoutes(_req, res) {
  const data = listTransactions();

  res.writeHead(200);
  res.end(JSON.stringify(data));
}

module.exports = { handleTransactionsRoutes };
