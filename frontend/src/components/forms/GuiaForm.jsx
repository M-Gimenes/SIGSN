import PessoaFields from './PessoaFields.jsx';
import { SelectField } from '../ui/Field.jsx';

const DISPONIBILIDADE = ['MANHA', 'TARDE', 'NOITE'];

export const guiaEmpty = {
  nome: '', cpf: '', telefone: '', email: '',
  especialidade: '', login: '', senha: '',
  status: 'true', disponibilidade: '',
};

export function guiaFromRecord(record) {
  if (!record) return guiaEmpty;
  return {
    nome: record.nome ?? '',
    cpf: record.cpf ?? '',
    telefone: record.telefone ?? '',
    email: record.email ?? '',
    especialidade: record.especialidade ?? '',
    login: record.login ?? '',
    senha: '',
    status: record.status === false ? 'false' : 'true',
    disponibilidade: record.disponibilidade ?? '',
  };
}

export function guiaBody(data) {
  const body = {
    nome: data.nome,
    cpf: data.cpf,
    telefone: data.telefone,
    email: data.email,
    especialidade: data.especialidade,
    login: data.login,
    status: data.status === 'false' ? false : true,
    disponibilidade: data.disponibilidade,
  };
  if (data.senha) body.senha = data.senha;
  return body;
}

export default function GuiaForm({ values, set, editing }) {
  return (
    <PessoaFields
      values={values}
      set={set}
      editing={editing}
      extraFields={
        <SelectField
          label="Disponibilidade"
          name="disponibilidade"
          required
          value={values.disponibilidade}
          onChange={(v) => set('disponibilidade', v)}
          options={DISPONIBILIDADE}
        />
      }
    />
  );
}
