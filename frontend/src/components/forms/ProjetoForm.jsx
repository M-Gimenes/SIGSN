import { SelectField, TextField } from '../ui/Field.jsx';
import { useFkOptions } from '../../hooks/useFkOptions.js';
import LoadingState from '../ui/LoadingState.jsx';
import { toDateInputValue } from '../../utils/format.js';

const STATUS_OPTIONS = ['ativo', 'concluido', 'suspenso'];

export const projetoEmpty = {
  titulo: '', dataInicio: '', dataTermino: '', status: 'ativo',
  areaDePesquisa: '', grupoDePesquisaId: '', coordenadorId: '',
};

export function projetoFromRecord(record) {
  if (!record) return projetoEmpty;
  return {
    titulo: record.titulo ?? '',
    dataInicio: toDateInputValue(record.dataInicio),
    dataTermino: toDateInputValue(record.dataTermino),
    status: record.status ?? 'ativo',
    areaDePesquisa: record.areaDePesquisa ?? '',
    grupoDePesquisaId: record.grupoDePesquisaId ?? '',
    coordenadorId: record.coordenadorId ?? '',
  };
}

export function projetoBody(data) {
  return {
    titulo: data.titulo,
    dataInicio: data.dataInicio || undefined,
    dataTermino: data.dataTermino || undefined,
    status: data.status || 'ativo',
    areaDePesquisa: data.areaDePesquisa,
    grupoDePesquisaId: data.grupoDePesquisaId ? Number(data.grupoDePesquisaId) : undefined,
    coordenadorId: data.coordenadorId ? Number(data.coordenadorId) : undefined,
  };
}

export default function ProjetoForm({ values, set }) {
  const { loading, data } = useFkOptions(['/grupos-de-pesquisa', '/coordenadores']);
  if (loading) return <LoadingState>Carregando opções…</LoadingState>;

  const grupos = data['/grupos-de-pesquisa'] || [];
  const coordenadores = data['/coordenadores'] || [];

  return (
    <>
      <TextField label="Título" name="titulo" required value={values.titulo} onChange={(v) => set('titulo', v)} />
      <TextField
        label="Área de Pesquisa"
        name="areaDePesquisa"
        required
        value={values.areaDePesquisa}
        onChange={(v) => set('areaDePesquisa', v)}
      />
      <div className="fields-row">
        <SelectField
          label="Grupo de Pesquisa"
          name="grupoDePesquisaId"
          required
          value={values.grupoDePesquisaId}
          onChange={(v) => set('grupoDePesquisaId', v)}
          options={grupos.map((g) => ({ value: g.id, label: g.nome }))}
        />
        <SelectField
          label="Coordenador"
          name="coordenadorId"
          required
          value={values.coordenadorId}
          onChange={(v) => set('coordenadorId', v)}
          options={coordenadores.map((c) => ({ value: c.id, label: c.nome }))}
        />
      </div>
      <div className="fields-row">
        <TextField
          label="Data de Início"
          name="dataInicio"
          type="date"
          required
          value={values.dataInicio}
          onChange={(v) => set('dataInicio', v)}
        />
        <TextField
          label="Data de Término"
          name="dataTermino"
          type="date"
          required
          value={values.dataTermino}
          onChange={(v) => set('dataTermino', v)}
        />
      </div>
      <SelectField
        label="Status"
        name="status"
        required
        allowEmpty={false}
        value={values.status}
        onChange={(v) => set('status', v)}
        options={STATUS_OPTIONS}
      />
    </>
  );
}
