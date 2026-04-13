import { Op } from 'sequelize';
import { ValidationError } from '../utils/errors.js';
import { validarCampos } from '../utils/validate.js';
import { Caravana } from '../models/Caravana.js';
import { Agendamento } from '../models/Agendamento.js';

const include = [{ model: Agendamento, as: 'agendamento' }];

// ─── Validação ────────────────────────────────────────────────────────────────

async function assertValido(dados) {
  const erros = await validarCampos(Caravana, dados);
  if (erros.length > 0) throw new ValidationError(erros);
}

// ─── Service ──────────────────────────────────────────────────────────────────

class CaravanaService {
  static async findAll() {
    return Caravana.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Caravana.findByPk(id, { include });
  }

  static async create(req) {
    const { nome, tipoCaravana, instituicao, responsavel, telefone, quantidadeVisitantes, observacoes } = req.body;
    const dados = { nome, tipoCaravana, instituicao, responsavel, telefone, quantidadeVisitantes, observacoes };

    await assertValido(dados);
    const caravana = await Caravana.create(dados);
    return Caravana.findByPk(caravana.id, { include });
  }

  static async update(req) {
    const { id } = req.params;
    const { nome, tipoCaravana, instituicao, responsavel, telefone, quantidadeVisitantes, observacoes } = req.body;

    const caravana = await Caravana.findByPk(id);
    if (!caravana) throw new ValidationError('Caravana não encontrada.');

    const dados = {
      nome:                 nome                 ?? caravana.nome,
      tipoCaravana:         tipoCaravana         ?? caravana.tipoCaravana,
      instituicao:          instituicao          ?? caravana.instituicao,
      responsavel:          responsavel          ?? caravana.responsavel,
      telefone:             telefone             ?? caravana.telefone,
      quantidadeVisitantes: quantidadeVisitantes ?? caravana.quantidadeVisitantes,
      observacoes:          observacoes          ?? caravana.observacoes,
    };

    await assertValido(dados);

    Object.assign(caravana, dados);
    await caravana.save();
    return Caravana.findByPk(caravana.id, { include });
  }

  static async delete(req) {
    const { id } = req.params;
    const caravana = await Caravana.findByPk(id);
    if (!caravana) throw new ValidationError('Caravana não encontrada.');

    const agendamentoFuturo = await Agendamento.findOne({
      attributes: ['id'],
      where: {
        caravanaId: id,
        dataVisita: { [Op.gt]: new Date() },
      },
    });
    if (agendamentoFuturo) {
      throw new ValidationError('Não é possível remover a caravana: está vinculada a um agendamento futuro.');
    }

    await caravana.destroy();
    return caravana;
  }
}

export { CaravanaService };
