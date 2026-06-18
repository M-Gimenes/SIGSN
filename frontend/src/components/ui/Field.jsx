export function TextField({ label, name, type = 'text', value, onChange, required, step, placeholder }) {
  return (
    <div className="field">
      <label>
        {label}
        {required ? ' *' : ''}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ''}
        step={step}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value, e)}
      />
    </div>
  );
}

export function TextAreaField({ label, name, value, onChange, rows }) {
  return (
    <div className="field">
      <label>{label}</label>
      <textarea
        name={name}
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value, e)}
      />
    </div>
  );
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required,
  placeholder = '— selecione —',
  allowEmpty = true,
}) {
  return (
    <div className="field">
      <label>
        {label}
        {required ? ' *' : ''}
      </label>
      <select name={name} value={value ?? ''} onChange={(e) => onChange?.(e.target.value, e)}>
        {allowEmpty && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const v = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={v} value={v}>
              {lbl}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export function MultiSelectField({ label, name, value = [], onChange, options }) {
  const set = new Set((value || []).map(String));
  const toggle = (v) => {
    const next = new Set(set);
    const key = String(v);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange?.(Array.from(next));
  };
  return (
    <div className="field" data-name={name}>
      <label>{label}</label>
      <div className="multi-select">
        {options.length === 0 && <small style={{ color: 'var(--ink-mute)' }}>Sem opções disponíveis.</small>}
        {options.map((opt) => {
          const v = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          const selected = set.has(String(v));
          return (
            <button
              key={v}
              type="button"
              className={`multi-tag${selected ? ' selected' : ''}`}
              onClick={() => toggle(v)}
            >
              {lbl}
            </button>
          );
        })}
      </div>
    </div>
  );
}
