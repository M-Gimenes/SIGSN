import { useMemo } from 'react';

import Icon from '../ui/Icon.jsx';
import LoadingState from '../ui/LoadingState.jsx';
import { SelectField, TextField } from '../ui/Field.jsx';
import { useFkOptions } from '../../hooks/useFkOptions.js';

export default function ReportFilters({ filters, values, onChange, onApply, onClear, busy }) {
  const fkEndpoints = useMemo(
    () => filters.filter((f) => f.type === 'fk').map((f) => f.endpoint),
    [filters],
  );
  const fk = useFkOptions(fkEndpoints);

  const set = (name, value) => onChange({ ...values, [name]: value });

  return (
    <div className="filter-card">
      <div className="filter-eyebrow">
        <Icon name="ic-filter" />
        <span>Filtros</span>
      </div>
      <div className="filter-grid">
        {fk.loading ? (
          <LoadingState>Carregando filtros…</LoadingState>
        ) : (
          filters.map((f) => {
            if (f.type === 'fk') {
              const opts = (fk.data[f.endpoint] || []).map((item) => ({
                value: item.id,
                label: f.labelFn(item),
              }));
              return (
                <SelectField
                  key={f.name}
                  label={f.label}
                  name={f.name}
                  value={values[f.name] ?? ''}
                  onChange={(v) => set(f.name, v)}
                  options={opts}
                  placeholder="— qualquer —"
                />
              );
            }
            if (f.type === 'select') {
              return (
                <SelectField
                  key={f.name}
                  label={f.label}
                  name={f.name}
                  value={values[f.name] ?? ''}
                  onChange={(v) => set(f.name, v)}
                  options={f.options}
                  placeholder="— qualquer —"
                />
              );
            }
            return (
              <TextField
                key={f.name}
                label={f.label}
                name={f.name}
                type={f.type || 'text'}
                value={values[f.name] ?? ''}
                onChange={(v) => set(f.name, v)}
              />
            );
          })
        )}
      </div>
      <div className="filter-actions">
        <button className="btn-cancel" onClick={onClear} disabled={busy}>
          Limpar
        </button>
        <button className="btn-secondary" onClick={onApply} disabled={busy || fk.loading}>
          <Icon name="ic-filter" width={11} height={11} />
          {busy ? 'Gerando…' : 'Gerar'}
        </button>
      </div>
    </div>
  );
}
