import { Coordenador } from '../models/Coordenador.js';

class CoordenadorService {
  static async findAll() {
    return Coordenador.findAll();
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Coordenador.findByPk(id);
  }

  static async create(req) {
    const { nome, cpf, telefone, email, status, especialidade, login, senha } = req.body;
    return Coordenador.create({ nome, cpf, telefone, email, status, especialidade, login, senha });
  }

  static async update(req) {
    const { id } = req.params;
    const obj = await Coordenador.findByPk(id);
    if (!obj) throw new Error('Coordenador não encontrado.');

    const { nome, cpf, telefone, email, status, especialidade, login, senha } = req.body;
    if (nome !== undefined) obj.nome = nome;
    if (cpf !== undefined) obj.cpf = cpf;
    if (telefone !== undefined) obj.telefone = telefone;
    if (email !== undefined) obj.email = email;
    if (status !== undefined) obj.status = status;
    if (especialidade !== undefined) obj.especialidade = especialidade;
    if (login !== undefined) obj.login = login;
    if (senha !== undefined) obj.senha = senha;
    await obj.save();
    return obj;
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
        throw new Error('Não é possível remover o coordenador: existem projetos vinculados.');
      }
      throw error;
    }
  }
}

export { CoordenadorService };
