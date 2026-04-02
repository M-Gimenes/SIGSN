import { Caravana } from '../models/Caravana.js';
import { Agendamento } from '../models/Agendamento.js';

const include = [{ model: Agendamento, as: 'agendamento' }];

class CaravanaService {
  static async findAll(req) {
    return Caravana.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Caravana.findByPk(id, { include });
  }

  static async create(req) {
    const {
      nome,
      tipoCaravana,
      instituicao,
      responsavel,
      telefone,
      quantidadeVisitantes,
      observacoes,
    } = req.body;
    const obj = await Caravana.create({
      nome,
      tipoCaravana,
      instituicao,
      responsavel,
      telefone,
      quantidadeVisitantes,
      observacoes,
    });
    return Caravana.findByPk(obj.id, { include });
  }

  static async update(req) {
    const { id } = req.params;
    const obj = await Caravana.findByPk(id);
    if (!obj) throw new Error('Caravana não encontrada.');
    const {
      nome,
      tipoCaravana,
      instituicao,
      responsavel,
      telefone,
      quantidadeVisitantes,
      observacoes,
    } = req.body;
    Object.assign(obj, {
      nome,
      tipoCaravana,
      instituicao,
      responsavel,
      telefone,
      quantidadeVisitantes,
      observacoes,
    });
    await obj.save();
    return Caravana.findByPk(obj.id, { include });
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Caravana.findByPk(id);
    if (!obj) throw new Error('Caravana não encontrada.');
    try {
      await obj.destroy();
      return obj;
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error('Não é possível remover a caravana: existe agendamento vinculado.');
      }
      throw error;
    }
  }
}

export { CaravanaService };
