import { SelectField, TextAreaField, TextField } from '../ui/Field.jsx';
import { useFkOptions } from '../../hooks/useFkOptions.js';
import LoadingState from '../ui/LoadingState.jsx';
import { toDateTimeLocalValue } from '../../utils/format.js';

export const agendamentoEmpty = {
  dataVisita: '', valorVisita: '', observacoes: '',
  guiaId: '', caravanaId: '',
};

export function agendamentoFromRecord(record) {
  if (!record) return agendamentoEmpty;
  return {
    dataVisita: toDateTimeLocalValue(record.dataVisita),
    valorVisita: record.valorVisita ?? '',
    observacoes: record.observacoes ?? '',
    guiaId: record.guiaId ?? '',
    caravanaId: record.caravanaId ?? '',
  };
}

export function agendamentoBody(data) {
  return {
    dataVisita: data.dataVisita,
    valorVisita: data.valorVisita !== '' ? Number(data.valorVisita) : undefined,
    observacoes: data.observacoes || undefined,
    guiaId: data.guiaId ? Number(data.guiaId) : undefined,
    caravanaId: data.caravanaId ? Number(data.caravanaId) : undefined,
  };
}

export default function AgendamentoForm({ values, set }) {
  const { loading, data } = useFkOptions(['/guias', '/caravanas']);
  if (loading) return <LoadingState>Carregando opções…</LoadingState>;

  const guias = data['/guias'] || [];
  const caravanas = data['/caravanas'] || [];

  return (
    <>
      <div className="fields-row">
        <TextField
          label="Data e Hora da Visita"
          name="dataVisita"
          type="datetime-local"
          required
          value={values.dataVisita}
          onChange={(v) => set('dataVisita', v)}
        />
        <TextField
          label="Valor da Visita"
          name="valorVisita"
          type="number"
          step="0.01"
          value={values.valorVisita}
          onChange={(v) => set('valorVisita', v)}
        />
      </div>
      <SelectField
        label="Guia"
        name="guiaId"
        required
        value={values.guiaId}
        onChange={(v) => set('guiaId', v)}
        options={guias.map((g) => ({ value: g.id, label: `${g.nome} (${g.disponibilidade})` }))}
      />
      <SelectField
        label="Caravana"
        name="caravanaId"
        required
        value={values.caravanaId}
        onChange={(v) => set('caravanaId', v)}
        options={caravanas.map((c) => ({ value: c.id, label: `${c.nome} — ${c.tipoCaravana}` }))}
      />
      <TextAreaField label="Observações" name="observacoes" value={values.observacoes} onChange={(v) => set('observacoes', v)} />
    </>
  );
}
