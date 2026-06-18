export default function StatsStrip({ stats, totals }) {
  if (!stats?.length || !totals) return null;
  return (
    <div className="stats-strip">
      {stats.map((s) => {
        const raw = totals[s.key];
        const display = s.fmt ? s.fmt(raw) : raw != null ? String(raw) : '0';
        return (
          <div key={s.key} className="stat-block">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{display}</div>
            {s.sub && <div className="stat-sub">{s.sub}</div>}
          </div>
        );
      })}
    </div>
  );
}
