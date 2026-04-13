import { Op } from 'sequelize';
import { ValidationError } from '../utils/errors.js';
import { validarCampos } from '../utils/validate.js';
import { Guia } from '../models/Guia.js';
import { Agendamento } from '../models/Agendamento.js';

// ─── Validação ────────────────────────────────────────────────────────────────

async function assertValido(dados) {
  const erros = await validarCampos(Guia, dados);
  if (erros.length > 0) throw new ValidationError(erros);
}

// ─── Service ──────────────────────────────────────────────────────────────────

class GuiaService {
  static async findAll() {
    return Guia.findAll();
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Guia.findByPk(id);
  }

  static async create(req) {
    const { nome, cpf, telefone, email, status, especialidade, login, senha, disponibilidade } = req.body;
    const dados = { nome, cpf, telefone, email, status, especialidade, login, senha, disponibilidade };

    await assertValido(dados);
    return Guia.create(dados);
  }

  static async update(req) {
    const { id } = req.params;
    const { nome, cpf, telefone, email, status, especialidade, login, senha, disponibilidade } = req.body;

    const guia = await Guia.findByPk(id);
    if (!guia) throw new ValidationError('Guia não encontrado.');

    const dados = {
      nome:            nome            ?? guia.nome,
      cpf:             cpf             ?? guia.cpf,
      telefone:        telefone        ?? guia.telefone,
      email:           email           ?? guia.email,
      status:          status          ?? guia.status,
      especialidade:   especialidade   ?? guia.especialidade,
      login:           login           ?? guia.login,
      senha:           senha           ?? guia.senha,
      disponibilidade: disponibilidade ?? guia.disponibilidade,
    };

    await assertValido(dados);

    Object.assign(guia, dados);
    await guia.save();
    return guia;
  }

  static async delete(req) {
    const { id } = req.params;
    const guia = await Guia.findByPk(id);
    if (!guia) throw new ValidationError('Guia não encontrado.');

    const agendamentoFuturo = await Agendamento.findOne({
      attributes: ['id'],
      where: {
        guiaId: id,
        dataVisita: { [Op.gt]: new Date() },
      },
    });
    if (agendamentoFuturo) {
      throw new ValidationError('Não é possível remover o guia: está vinculado a um agendamento futuro.');
    }

    await guia.destroy();
    return guia;
  }
}

export { GuiaService };
