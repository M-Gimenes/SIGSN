import { Pesquisador } from '../models/Pesquisador.js';
import { GrupoDePesquisa } from '../models/GrupoDePesquisa.js';

const include = [
  {
    model: GrupoDePesquisa,
    as: 'gruposDePesquisa',
    through: { attributes: [] },
  },
];

class PesquisadorService {
  static async findAll() {
    return Pesquisador.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Pesquisador.findByPk(id, { include });
  }

  static async create(req) {
    const { nome, cpf, telefone, email, status, especialidade, login, senha } = req.body;
    const pesquisador = await Pesquisador.create({
      nome,
      cpf,
      telefone,
      email,
      status,
      especialidade,
      login,
      senha,
    });
    return Pesquisador.findByPk(pesquisador.id, { include });
  }

  static async update(req) {
    const { id } = req.params;
    const pesquisador = await Pesquisador.findByPk(id);
    if (!pesquisador) throw new Error('Pesquisador não encontrado.');

    const { nome, cpf, telefone, email, status, especialidade, login, senha } = req.body;
    if (nome !== undefined) pesquisador.nome = nome;
    if (cpf !== undefined) pesquisador.cpf = cpf;
    if (telefone !== undefined) pesquisador.telefone = telefone;
    if (email !== undefined) pesquisador.email = email;
    if (status !== undefined) pesquisador.status = status;
    if (especialidade !== undefined) pesquisador.especialidade = especialidade;
    if (login !== undefined) pesquisador.login = login;
    if (senha !== undefined) pesquisador.senha = senha;
    await pesquisador.save();
    return Pesquisador.findByPk(pesquisador.id, { include });
  }

  static async delete(req) {
    const { id } = req.params;
    const pesquisador = await Pesquisador.findByPk(id);
    if (!pesquisador) throw new Error('Pesquisador não encontrado.');
    try {
      await pesquisador.destroy();
      return pesquisador;
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error('Não é possível remover o pesquisador: existem vínculos no sistema.');
      }
      throw error;
    }
  }
}

export { PesquisadorService };
