import "./DataTable.css";

export default function DataTable({ columns, rows, onEdit, onDelete, emptyMessage }) {
  return (
    <div className="table-card">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            <th className="actions-column">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="empty-cell">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
                ))}
                <td className="actions-column">
                  <div className="table-actions">
                    <button type="button" className="button-secondary" onClick={() => onEdit(row)}>
                      Editar
                    </button>
                    <button type="button" className="button-danger" onClick={() => onDelete(row)}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
