import { SelectField, TextAreaField, TextField } from '../ui/Field.jsx';

const HEMISFERIOS = ['Norte', 'Sul', 'Equatorial'];

export const constelacaoEmpty = {
  nome: '', hemisferio: '', periodoVisibilidade: '',
  principaisEstrelas: '', descricao: '', curiosidades: '',
};

export function constelacaoFromRecord(record) {
  if (!record) return constelacaoEmpty;
  return {
    nome: record.nome ?? '',
    hemisferio: record.hemisferio ?? '',
    periodoVisibilidade: record.periodoVisibilidade ?? '',
    principaisEstrelas: record.principaisEstrelas ?? '',
    descricao: record.descricao ?? '',
    curiosidades: record.curiosidades ?? '',
  };
}

export function constelacaoBody(data) {
  return {
    nome: data.nome,
    hemisferio: data.hemisferio,
    periodoVisibilidade: data.periodoVisibilidade,
    principaisEstrelas: data.principaisEstrelas,
    descricao: data.descricao,
    curiosidades: data.curiosidades || undefined,
  };
}

export default function ConstelacaoForm({ values, set }) {
  return (
    <>
      <div className="fields-row">
        <TextField label="Nome" name="nome" required value={values.nome} onChange={(v) => set('nome', v)} />
        <SelectField
          label="Hemisfério"
          name="hemisferio"
          required
          value={values.hemisferio}
          onChange={(v) => set('hemisferio', v)}
          options={HEMISFERIOS}
        />
      </div>
      <TextField
        label="Período de Visibilidade"
        name="periodoVisibilidade"
        required
        value={values.periodoVisibilidade}
        onChange={(v) => set('periodoVisibilidade', v)}
        placeholder="Ex.: Outubro a Março"
      />
      <TextField
        label="Principais Estrelas"
        name="principaisEstrelas"
        required
        value={values.principaisEstrelas}
        onChange={(v) => set('principaisEstrelas', v)}
        placeholder="Ex.: Betelgeuse, Rigel"
      />
      <TextAreaField label="Descrição" name="descricao" value={values.descricao} onChange={(v) => set('descricao', v)} />
      <TextAreaField label="Curiosidades" name="curiosidades" value={values.curiosidades} onChange={(v) => set('curiosidades', v)} />
    </>
  );
}
