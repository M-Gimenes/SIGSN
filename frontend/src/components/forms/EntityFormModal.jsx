import { useEffect, useMemo, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import { ApiError } from '../../api/client.js';
import { entityApi } from '../../api/services.js';

export default function EntityFormModal({ open, entity, definition, record, onClose, onSaved }) {
  const editing = Boolean(record);
  const [values, setValues] = useState(definition.empty);
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setValues(definition.fromRecord ? definition.fromRecord(record) : definition.empty);
    setErrors([]);
    setSaving(false);
  }, [open, record, definition]);

  const set = useMemo(
    () => (name, value) => setValues((prev) => ({ ...prev, [name]: value })),
    [],
  );

  if (!open) return null;

  const FormBody = definition.Form;

  async function handleSave() {
    setSaving(true);
    setErrors([]);
    try {
      const body = definition.toBody(values);
      if (editing) await entityApi.update(entity, record.id, body);
      else await entityApi.create(entity, body);
      onSaved?.(editing);
    } catch (err) {
      if (err instanceof ApiError && err.payload?.errors) setErrors(err.payload.errors);
      else setErrors([err.message || 'Erro desconhecido.']);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={saving ? undefined : onClose}>
      <div className="modal-head">
        <div className="eyebrow">{definition.label}</div>
        <h2>
          {editing ? 'Editar ' : 'Novo '}
          <em>registro</em>
        </h2>
      </div>
      <div className="modal-body">
        <FormBody values={values} set={set} editing={editing} record={record} />
        {errors.length > 0 && (
          <div className="modal-errors">
            {errors.map((m, i) => (
              <div key={i} className="field-error">
                ✕ {m}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="modal-foot">
        <button className="btn-cancel" onClick={onClose} disabled={saving}>
          Cancelar
        </button>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </Modal>
  );
}
