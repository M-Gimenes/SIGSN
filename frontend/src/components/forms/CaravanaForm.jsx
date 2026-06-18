import { SelectField, TextAreaField, TextField } from '../ui/Field.jsx';

const TIPOS = ['Escolar', 'Universitária', 'Turística', 'Institucional'];

export const caravanaEmpty = {
  nome: '', tipoCaravana: '', instituicao: '', responsavel: '',
  telefone: '', quantidadeVisitantes: '', observacoes: '',
};

export function caravanaFromRecord(record) {
  if (!record) return caravanaEmpty;
  return {
    nome: record.nome ?? '',
    tipoCaravana: record.tipoCaravana ?? '',
    instituicao: record.instituicao ?? '',
    responsavel: record.responsavel ?? '',
    telefone: record.telefone ?? '',
    quantidadeVisitantes: record.quantidadeVisitantes ?? '',
    observacoes: record.observacoes ?? '',
  };
}

export function caravanaBody(data) {
  return {
    nome: data.nome,
    tipoCaravana: data.tipoCaravana,
    instituicao: data.instituicao,
    responsavel: data.responsavel,
    telefone: data.telefone,
    quantidadeVisitantes: data.quantidadeVisitantes ? Number(data.quantidadeVisitantes) : undefined,
    observacoes: data.observacoes || undefined,
  };
}

export default function CaravanaForm({ values, set }) {
  return (
    <>
      <TextField label="Nome" name="nome" required value={values.nome} onChange={(v) => set('nome', v)} />
      <SelectField
        label="Tipo de Caravana"
        name="tipoCaravana"
        required
        value={values.tipoCaravana}
        onChange={(v) => set('tipoCaravana', v)}
        options={TIPOS}
      />
      <div className="fields-row">
        <TextField label="Instituição" name="instituicao" required value={values.instituicao} onChange={(v) => set('instituicao', v)} />
        <TextField label="Responsável" name="responsavel" required value={values.responsavel} onChange={(v) => set('responsavel', v)} />
      </div>
      <div className="fields-row">
        <TextField label="Telefone" name="telefone" required value={values.telefone} onChange={(v) => set('telefone', v)} />
        <TextField
          label="Qtd. de Visitantes (1–50)"
          name="quantidadeVisitantes"
          type="number"
          required
          value={values.quantidadeVisitantes}
          onChange={(v) => set('quantidadeVisitantes', v)}
        />
      </div>
      <TextAreaField label="Observações" name="observacoes" value={values.observacoes} onChange={(v) => set('observacoes', v)} />
    </>
  );
}
