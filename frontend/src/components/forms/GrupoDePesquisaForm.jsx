import { MultiSelectField, SelectField, TextAreaField, TextField } from '../ui/Field.jsx';
import { useFkOptions } from '../../hooks/useFkOptions.js';
import LoadingState from '../ui/LoadingState.jsx';
import { toDateInputValue } from '../../utils/format.js';

const STATUS_OPTIONS = [
  { value: 'true', label: 'Ativo' },
  { value: 'false', label: 'Inativo' },
];

export const grupoEmpty = {
  nome: '', areaDePesquisa: '', dataCriacao: '',
  descricao: '', status: 'true', pesquisadorIds: [],
};

export function grupoFromRecord(record) {
  if (!record) return grupoEmpty;
  return {
    nome: record.nome ?? '',
    areaDePesquisa: record.areaDePesquisa ?? '',
    dataCriacao: toDateInputValue(record.dataCriacao),
    descricao: record.descricao ?? '',
    status: record.status === false ? 'false' : 'true',
    pesquisadorIds: (record.pesquisadores || []).map((p) => p.id),
  };
}

export function grupoBody(data) {
  return {
    nome: data.nome,
    areaDePesquisa: data.areaDePesquisa,
    dataCriacao: data.dataCriacao || undefined,
    descricao: data.descricao || undefined,
    status: data.status === 'false' ? false : true,
    pesquisadorIds: (data.pesquisadorIds || []).map((v) => Number(v)),
  };
}

export default function GrupoDePesquisaForm({ values, set }) {
  const { loading, data } = useFkOptions(['/pesquisadores']);
  if (loading) return <LoadingState>Carregando pesquisadores…</LoadingState>;

  const pesquisadores = data['/pesquisadores'] || [];
  const pesquisadorOptions = pesquisadores.map((p) => ({ value: p.id, label: p.nome }));

  return (
    <>
      <TextField label="Nome" name="nome" required value={values.nome} onChange={(v) => set('nome', v)} />
      <div className="fields-row">
        <TextField
          label="Área de Pesquisa"
          name="areaDePesquisa"
          required
          value={values.areaDePesquisa}
          onChange={(v) => set('areaDePesquisa', v)}
        />
        <TextField
          label="Data de Criação"
          name="dataCriacao"
          type="date"
          required
          value={values.dataCriacao}
          onChange={(v) => set('dataCriacao', v)}
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
      <TextAreaField label="Descrição" name="descricao" value={values.descricao} onChange={(v) => set('descricao', v)} />
      <MultiSelectField
        label="Pesquisadores vinculados"
        name="pesquisadorIds"
        value={values.pesquisadorIds}
        onChange={(v) => set('pesquisadorIds', v)}
        options={pesquisadorOptions}
      />
    </>
  );
}
