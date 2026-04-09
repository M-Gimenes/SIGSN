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
    const obj = await Pesquisador.create({
      nome,
      cpf,
      telefone,
      email,
      status,
      especialidade,
      login,
      senha,
    });
    return Pesquisador.findByPk(obj.id, { include });
  }

  static async update(req) {
    const { id } = req.params;
    const obj = await Pesquisador.findByPk(id);
    if (!obj) throw new Error('Pesquisador não encontrado.');

    const { nome, cpf, telefone, email, status, especialidade, login, senha } = req.body;
    if (nome !== undefined) obj.nome = nome;
    if (cpf !== undefined) obj.cpf = cpf;
    if (telefone !== undefined) obj.telefone = telefone;
    if (email !== undefined) obj.email = email;
    if (status !== undefined) obj.status = status;
    if (especialidade !== undefined) obj.especialidade = especialidade;
    if (login !== undefined) obj.login = login;
    if (senha !== undefined) obj.senha = senha;
    await obj.save();
    return Pesquisador.findByPk(obj.id, { include });
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Pesquisador.findByPk(id);
    if (!obj) throw new Error('Pesquisador não encontrado.');
    try {
      await obj.destroy();
      return obj;
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error('Não é possível remover o pesquisador: existem vínculos no sistema.');
      }
      throw error;
    }
  }
}

export { PesquisadorService };
