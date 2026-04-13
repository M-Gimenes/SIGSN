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
    const guia = await Guia.findByPk(id);
    if (!guia) throw new Error('Guia não encontrado.');

    const { nome, cpf, telefone, email, status, especialidade, disponibilidade } = req.body;
    if (nome !== undefined) guia.nome = nome;
    if (cpf !== undefined) guia.cpf = cpf;
    if (telefone !== undefined) guia.telefone = telefone;
    if (email !== undefined) guia.email = email;
    if (status !== undefined) guia.status = status;
    if (especialidade !== undefined) guia.especialidade = especialidade;
    if (disponibilidade !== undefined) guia.disponibilidade = disponibilidade;
    await guia.save();
    return guia;
  }

  static async delete(req) {
    const { id } = req.params;
    const guia = await Guia.findByPk(id);
    if (!guia) throw new Error('Guia não encontrado.');

    // RF07: não pode remover se vinculado a agendamento futuro
    const agendamentoFuturo = await Agendamento.findOne({
      attributes: ['id'],
      where: {
        guiaId: id,
        dataVisita: { [Op.gt]: new Date() },
      },
    });
    if (agendamentoFuturo) {
      throw new Error('Não é possível remover o guia: está vinculado a um agendamento futuro.');
    }

    await guia.destroy();
    return guia;
  }
}

export { GuiaService };
