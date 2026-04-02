import { Guia } from '../models/Guia.js';

const include = { all: true, nested: true };

class GuiaService {
  static async findAll(req) {
    return Guia.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Guia.findByPk(id, { include });
  }

  static async create(req) {
    const { nome, cpf, telefone, email, status, especialidade, disponibilidade } = req.body;
    const obj = await Guia.create({
      nome,
      cpf,
      telefone,
      email,
      status,
      especialidade,
      disponibilidade,
    });
    return Guia.findByPk(obj.id, { include });
  }

  static async update(req) {
    const { id } = req.params;
    const obj = await Guia.findByPk(id);
    if (!obj) throw new Error('Guia não encontrado.');
    const { nome, cpf, telefone, email, status, especialidade, disponibilidade } = req.body;
    Object.assign(obj, { nome, cpf, telefone, email, status, especialidade, disponibilidade });
    await obj.save();
    return Guia.findByPk(obj.id, { include });
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Guia.findByPk(id);
    if (!obj) throw new Error('Guia não encontrado.');
    try {
      await obj.destroy();
      return obj;
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error('Não é possível remover o guia: existem agendamentos vinculados.');
      }
      throw error;
    }
  }
}

export { GuiaService };
