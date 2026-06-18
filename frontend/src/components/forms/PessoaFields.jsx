import { SelectField, TextField } from '../ui/Field.jsx';

const BOOL_OPTIONS = [
  { value: 'true', label: 'Ativo' },
  { value: 'false', label: 'Inativo' },
];

export default function PessoaFields({ values, set, editing, extraFields, statusField = 'boolean' }) {
  return (
    <>
      <div className="fields-row">
        <TextField label="Nome" name="nome" required value={values.nome} onChange={(v) => set('nome', v)} />
        <TextField label="CPF" name="cpf" required value={values.cpf} onChange={(v) => set('cpf', v)} />
      </div>
      <div className="fields-row">
        <TextField label="Telefone" name="telefone" required value={values.telefone} onChange={(v) => set('telefone', v)} />
        <TextField label="E-mail" name="email" type="email" required value={values.email} onChange={(v) => set('email', v)} />
      </div>
      <TextField label="Especialidade" name="especialidade" required value={values.especialidade} onChange={(v) => set('especialidade', v)} />
      <div className="fields-row">
        <TextField label="Login" name="login" required value={values.login} onChange={(v) => set('login', v)} />
        <TextField
          label={editing ? 'Senha (deixe em branco para manter)' : 'Senha'}
          name="senha"
          type="password"
          required={!editing}
          value={values.senha}
          onChange={(v) => set('senha', v)}
        />
      </div>

      {extraFields}

      {statusField === 'boolean' && (
        <SelectField
          label="Status"
          name="status"
          required
          allowEmpty={false}
          value={values.status === undefined || values.status === '' ? 'true' : String(values.status)}
          onChange={(v) => set('status', v)}
          options={BOOL_OPTIONS}
        />
      )}
    </>
  );
}
