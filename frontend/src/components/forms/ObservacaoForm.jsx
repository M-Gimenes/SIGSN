import { SelectField, TextAreaField, TextField } from '../ui/Field.jsx';
import { useFkOptions } from '../../hooks/useFkOptions.js';
import LoadingState from '../ui/LoadingState.jsx';
import { toDateInputValue } from '../../utils/format.js';

export const observacaoEmpty = {
  dataObservacao: '', descricao: '', instrumentoUtilizado: '',
  projetoId: '', constelacaoId: '',
};

export function observacaoFromRecord(record) {
  if (!record) return observacaoEmpty;
  return {
    dataObservacao: toDateInputValue(record.dataObservacao),
    descricao: record.descricao ?? '',
    instrumentoUtilizado: record.instrumentoUtilizado ?? '',
    projetoId: record.projetoId ?? '',
    constelacaoId: record.constelacaoId ?? '',
  };
}

export function observacaoBody(data) {
  return {
    dataObservacao: data.dataObservacao,
    descricao: data.descricao,
    instrumentoUtilizado: data.instrumentoUtilizado,
    projetoId: data.projetoId ? Number(data.projetoId) : undefined,
    constelacaoId: data.constelacaoId ? Number(data.constelacaoId) : undefined,
  };
}

export default function ObservacaoForm({ values, set }) {
  const { loading, data } = useFkOptions(['/projetos', '/constelacoes']);
  if (loading) return <LoadingState>Carregando opções…</LoadingState>;

  const projetos = data['/projetos'] || [];
  const constelacoes = data['/constelacoes'] || [];

  return (
    <>
      <TextField
        label="Data da Observação"
        name="dataObservacao"
        type="date"
        required
        value={values.dataObservacao}
        onChange={(v) => set('dataObservacao', v)}
      />
      <div className="fields-row">
        <SelectField
          label="Projeto"
          name="projetoId"
          required
          value={values.projetoId}
          onChange={(v) => set('projetoId', v)}
          options={projetos.map((p) => ({ value: p.id, label: p.titulo }))}
        />
        <SelectField
          label="Constelação"
          name="constelacaoId"
          required
          value={values.constelacaoId}
          onChange={(v) => set('constelacaoId', v)}
          options={constelacoes.map((c) => ({ value: c.id, label: c.nome }))}
        />
      </div>
      <TextField
        label="Instrumento Utilizado"
        name="instrumentoUtilizado"
        required
        value={values.instrumentoUtilizado}
        onChange={(v) => set('instrumentoUtilizado', v)}
        placeholder="Ex.: Telescópio refletor 200mm"
      />
      <TextAreaField
        label="Descrição"
        name="descricao"
        value={values.descricao}
        onChange={(v) => set('descricao', v)}
      />
      <small style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '.18em', color: 'var(--ink-mute)' }}>
        A versão da observação é atribuída automaticamente pelo backend.
      </small>
    </>
  );
}
