import { Op } from 'sequelize';
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
    const caravana = await Caravana.create({
      nome,
      tipoCaravana,
      instituicao,
      responsavel,
      telefone,
      quantidadeVisitantes,
      observacoes,
    });
    return Caravana.findByPk(caravana.id, { include });
  }

  static async update(req) {
    const { id } = req.params;
    const caravana = await Caravana.findByPk(id);
    if (!caravana) throw new Error('Caravana não encontrada.');

    const { nome, tipoCaravana, instituicao, responsavel, telefone, quantidadeVisitantes, observacoes } =
      req.body;
    if (nome !== undefined) caravana.nome = nome;
    if (tipoCaravana !== undefined) caravana.tipoCaravana = tipoCaravana;
    if (instituicao !== undefined) caravana.instituicao = instituicao;
    if (responsavel !== undefined) caravana.responsavel = responsavel;
    if (telefone !== undefined) caravana.telefone = telefone;
    if (quantidadeVisitantes !== undefined) caravana.quantidadeVisitantes = quantidadeVisitantes;
    if (observacoes !== undefined) caravana.observacoes = observacoes;
    await caravana.save();
    return Caravana.findByPk(caravana.id, { include });
  }

  static async delete(req) {
    const { id } = req.params;
    const caravana = await Caravana.findByPk(id, { include });
    if (!caravana) throw new Error('Caravana não encontrada.');

    // RF03: não pode remover se vinculada a agendamento futuro
    const agendamentoFuturo = await Agendamento.findOne({
      attributes: ['id'],
      where: {
        caravanaId: id,
        dataVisita: { [Op.gt]: new Date() },
      },
    });
    if (agendamentoFuturo) {
      throw new Error('Não é possível remover a caravana: está vinculada a um agendamento futuro.');
    }

    await caravana.destroy();
    return caravana;
  }
}

export { CaravanaService };
