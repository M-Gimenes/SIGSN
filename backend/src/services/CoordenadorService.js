import { Coordenador } from '../models/Coordenador.js';

const include = { all: true, nested: true };

class CoordenadorService {
  static async findAll(req) {
    return Coordenador.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Coordenador.findByPk(id, { include });
  }

  static async create(req) {
    const { nome, cpf, telefone, email, status, especialidade, login, senha } = req.body;
    const obj = await Coordenador.create({
      nome,
      cpf,
      telefone,
      email,
      status,
      especialidade,
      login,
      senha,
    });
    return Coordenador.findByPk(obj.id, { include });
  }

  static async update(req) {
    const { id } = req.params;
    const obj = await Coordenador.findByPk(id);
    if (!obj) throw new Error('Coordenador não encontrado.');
    const { nome, cpf, telefone, email, status, especialidade, login, senha } = req.body;
    Object.assign(obj, { nome, cpf, telefone, email, status, especialidade, login, senha });
    await obj.save();
    return Coordenador.findByPk(obj.id, { include });
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Coordenador.findByPk(id);
    if (!obj) throw new Error('Coordenador não encontrado.');
    try {
      await obj.destroy();
      return obj;
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error('Não é possível remover o coordenador: existem projetos ou agendamentos vinculados.');
      }
      throw error;
    }
  }
}

export { CoordenadorService };
