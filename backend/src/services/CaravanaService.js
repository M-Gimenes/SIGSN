import { Caravana } from '../models/Caravana.js';
import { Agendamento } from '../models/Agendamento.js';

const include = [{ model: Agendamento, as: 'agendamento' }];

class CaravanaService {
  static async findAll() {
    return Caravana.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Caravana.findByPk(id, { include });
  }

  static async create(req) {
    const { nome, tipoCaravana, instituicao, responsavel, telefone, quantidadeVisitantes, observacoes } =
      req.body;
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

    const { nome, tipoCaravana, instituicao, responsavel, telefone, quantidadeVisitantes, observacoes } =
      req.body;
    if (nome !== undefined) obj.nome = nome;
    if (tipoCaravana !== undefined) obj.tipoCaravana = tipoCaravana;
    if (instituicao !== undefined) obj.instituicao = instituicao;
    if (responsavel !== undefined) obj.responsavel = responsavel;
    if (telefone !== undefined) obj.telefone = telefone;
    if (quantidadeVisitantes !== undefined) obj.quantidadeVisitantes = quantidadeVisitantes;
    if (observacoes !== undefined) obj.observacoes = observacoes;
    await obj.save();
    return Caravana.findByPk(obj.id, { include });
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Caravana.findByPk(id, { include });
    if (!obj) throw new Error('Caravana não encontrada.');

    // RF03: não pode remover se vinculada a agendamento futuro
    if (obj.agendamento && new Date(obj.agendamento.dataVisita) > new Date()) {
      throw new Error('Não é possível remover a caravana: está vinculada a um agendamento futuro.');
    }

    try {
      await obj.destroy();
      return obj;
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error('Não é possível remover a caravana: existem agendamentos vinculados.');
      }
      throw error;
    }
  }
}

export { CaravanaService };
