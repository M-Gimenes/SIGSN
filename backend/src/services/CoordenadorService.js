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
    const coordenador = await Coordenador.findByPk(id);
    if (!coordenador) throw new Error('Coordenador não encontrado.');

    const { nome, cpf, telefone, email, status, especialidade, login, senha } = req.body;
    if (nome !== undefined) coordenador.nome = nome;
    if (cpf !== undefined) coordenador.cpf = cpf;
    if (telefone !== undefined) coordenador.telefone = telefone;
    if (email !== undefined) coordenador.email = email;
    if (status !== undefined) coordenador.status = status;
    if (especialidade !== undefined) coordenador.especialidade = especialidade;
    if (login !== undefined) coordenador.login = login;
    if (senha !== undefined) coordenador.senha = senha;
    await coordenador.save();
    return coordenador;
  }

  static async delete(req) {
    const { id } = req.params;
    const coordenador = await Coordenador.findByPk(id);
    if (!coordenador) throw new Error('Coordenador não encontrado.');
    await coordenador.destroy();
    return coordenador;
  }
}

export { CoordenadorService };
