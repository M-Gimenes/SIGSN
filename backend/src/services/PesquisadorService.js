import { Pesquisador } from '../models/Pesquisador.js';

const include = { all: true, nested: true };

class PesquisadorService {
  static async findAll(req) {
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
    Object.assign(obj, { nome, cpf, telefone, email, status, especialidade, login, senha });
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
