const { transactions } = require("../data/transactions.data");

function listTransactions() {
  return {
    items: transactions
  };
}

module.exports = { listTransactions };
