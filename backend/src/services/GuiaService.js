import { Op } from 'sequelize';
import { Guia } from '../models/Guia.js';
import { Agendamento } from '../models/Agendamento.js';

class GuiaService {
  static async findAll() {
    return Guia.findAll();
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Guia.findByPk(id);
  }

  static async create(req) {
    const { nome, cpf, telefone, email, status, especialidade, disponibilidade } = req.body;
    return Guia.create({ nome, cpf, telefone, email, status, especialidade, disponibilidade });
  }

  static async update(req) {
    const { id } = req.params;
    const obj = await Guia.findByPk(id);
    if (!obj) throw new Error('Guia não encontrado.');

    const { nome, cpf, telefone, email, status, especialidade, disponibilidade } = req.body;
    if (nome !== undefined) obj.nome = nome;
    if (cpf !== undefined) obj.cpf = cpf;
    if (telefone !== undefined) obj.telefone = telefone;
    if (email !== undefined) obj.email = email;
    if (status !== undefined) obj.status = status;
    if (especialidade !== undefined) obj.especialidade = especialidade;
    if (disponibilidade !== undefined) obj.disponibilidade = disponibilidade;
    await obj.save();
    return obj;
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Guia.findByPk(id);
    if (!obj) throw new Error('Guia não encontrado.');

    // RF07: não pode remover se vinculado a agendamento futuro
    const agendamentoFuturo = await Agendamento.findOne({
      where: {
        guiaId: id,
        dataVisita: { [Op.gt]: new Date() },
      },
    });
    if (agendamentoFuturo) {
      throw new Error('Não é possível remover o guia: está vinculado a um agendamento futuro.');
    }

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
