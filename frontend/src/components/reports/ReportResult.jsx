import DataTable from '../ui/DataTable.jsx';
import StatsStrip from '../ui/StatsStrip.jsx';

function SubgroupTable({ subgroup, rows }) {
  if (!subgroup || !Array.isArray(rows) || rows.length === 0) return null;
  return (
    <>
      <div className="report-section-title">{subgroup.title}</div>
      <table className="subtotal-table">
        <thead>
          <tr>
            {subgroup.columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {subgroup.columns.map((c) => (
                <td key={c.key}>{row[c.key] != null ? String(row[c.key]) : '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default function ReportResult({ data, definition }) {
  if (!data) return null;
  const linhas = data.linhas || [];
  return (
    <>
      {linhas.length === 0 ? (
        <div className="empty-thin">Nenhum registro encontrado para os filtros aplicados.</div>
      ) : (
        <DataTable columns={definition.columns} rows={linhas.map((l, i) => ({ ...l, _idx: l.id ?? i }))} rowKey="_idx" />
      )}

      {definition.subgroup && (
        <SubgroupTable subgroup={definition.subgroup} rows={data[definition.subgroup.from]} />
      )}

      <StatsStrip stats={definition.stats} totals={data.totais} />
    </>
  );
}
