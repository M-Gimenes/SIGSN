import Icon from './Icon.jsx';

function getCellValue(col, row) {
  if (typeof col.key === 'function') return col.key(row);
  return row[col.key];
}

function renderCell(col, row) {
  const raw = getCellValue(col, row);
  if (col.render) return col.render(raw, row);
  if (col.fmt) return col.fmt(raw, row);
  if (raw == null || raw === '') return '—';
  return String(raw);
}

export default function DataTable({ columns, rows, onEdit, onDelete, rowKey = 'id' }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={c.label + i}>{c.label}</th>
            ))}
            {(onEdit || onDelete) && <th />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((col, i) => (
                <td key={i}>{renderCell(col, row)}</td>
              ))}
              {(onEdit || onDelete) && (
                <td>
                  <div className="row-actions">
                    {onEdit && (
                      <button className="btn-action" title="Editar" onClick={() => onEdit(row)}>
                        <Icon name="ic-edit" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="btn-action danger"
                        title="Excluir"
                        onClick={() => onDelete(row)}
                      >
                        <Icon name="ic-trash" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
