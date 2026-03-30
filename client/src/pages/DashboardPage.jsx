import "./DashboardPage.css";

const sampleCards = [
  { id: "income", title: "Income", value: "$12,400" },
  { id: "expenses", title: "Expenses", value: "$4,950" },
  { id: "balance", title: "Balance", value: "$7,450" }
];

const sampleRows = [
  { id: 1, category: "Salary", amount: "$8,000", status: "Confirmed" },
  { id: 2, category: "Rent", amount: "$1,200", status: "Scheduled" },
  { id: 3, category: "Utilities", amount: "$320", status: "Pending" }
];

export default function DashboardPage() {
  return (
    <main className="dashboard-page">
      <section className="hero">
        <div>
          <p className="eyebrow">Financial workspace</p>
          <h1>Build your financial operations dashboard.</h1>
          <p className="subtitle">
            This starter UI is ready for drag-and-drop widgets, table views,
            and backend data integration.
          </p>
        </div>
      </section>

      <section className="summary-grid">
        {sampleCards.map((card) => (
          <article key={card.id} className="summary-card">
            <span>{card.title}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Drag and drop board</h2>
            <span>Placeholder</span>
          </div>
          <div className="drop-zone">
            <div className="draggable-item">Revenue block</div>
            <div className="draggable-item">Expense block</div>
            <div className="draggable-item">Forecast block</div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Transactions table</h2>
            <span>Preview</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sampleRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.category}</td>
                  <td>{row.amount}</td>
                  <td>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
