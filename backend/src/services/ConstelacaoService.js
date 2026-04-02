import { Constelacao } from '../models/Constelacao.js';

const include = { all: true, nested: true };

class ConstelacaoService {
  static async findAll(req) {
    return Constelacao.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Constelacao.findByPk(id, { include });
  }

  static async create(req) {
    const {
      nome,
      hemisferio,
      periodoVisibilidade,
      principaisEstrelas,
      descricao,
      curiosidades,
    } = req.body;
    const obj = await Constelacao.create({
      nome,
      hemisferio,
      periodoVisibilidade,
      principaisEstrelas,
      descricao,
      curiosidades,
    });
    return Constelacao.findByPk(obj.id, { include });
  }

  static async update(req) {
    const { id } = req.params;
    const obj = await Constelacao.findByPk(id);
    if (!obj) throw new Error('Constelação não encontrada.');
    const {
      nome,
      hemisferio,
      periodoVisibilidade,
      principaisEstrelas,
      descricao,
      curiosidades,
    } = req.body;
    Object.assign(obj, {
      nome,
      hemisferio,
      periodoVisibilidade,
      principaisEstrelas,
      descricao,
      curiosidades,
    });
    await obj.save();
    return Constelacao.findByPk(obj.id, { include });
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Constelacao.findByPk(id);
    if (!obj) throw new Error('Constelação não encontrada.');
    try {
      await obj.destroy();
      return obj;
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error('Não é possível remover a constelação: existem observações vinculadas.');
      }
      throw error;
    }
  }
}

export { ConstelacaoService };
