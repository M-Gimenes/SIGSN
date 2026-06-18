import PessoaFields from './PessoaFields.jsx';

export const coordenadorEmpty = {
  nome: '', cpf: '', telefone: '', email: '',
  especialidade: '', login: '', senha: '',
  status: 'true',
};

export function coordenadorFromRecord(record) {
  if (!record) return coordenadorEmpty;
  return {
    nome: record.nome ?? '',
    cpf: record.cpf ?? '',
    telefone: record.telefone ?? '',
    email: record.email ?? '',
    especialidade: record.especialidade ?? '',
    login: record.login ?? '',
    senha: '',
    status: record.status === false ? 'false' : 'true',
  };
}

export function coordenadorBody(data) {
  const body = {
    nome: data.nome,
    cpf: data.cpf,
    telefone: data.telefone,
    email: data.email,
    especialidade: data.especialidade,
    login: data.login,
    status: data.status === 'false' ? false : true,
  };
  if (data.senha) body.senha = data.senha;
  return body;
}

export default function CoordenadorForm({ values, set, editing }) {
  return <PessoaFields values={values} set={set} editing={editing} />;
}
