import { Coordenador } from '../models/Coordenador.js';
import { ValidationError } from '../utils/errors.js';
import { validarCampos } from '../utils/validate.js';

// Matheus - Cadastro 

// ─── Validação ────────────────────────────────────────────────────────────────

async function assertValido(dados) {
  const erros = await validarCampos(Coordenador, dados);
  if (erros.length > 0) throw new ValidationError(erros);
}

// ─── Service ──────────────────────────────────────────────────────────────────

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
    const dados = { nome, cpf, telefone, email, status, especialidade, login, senha };

    await assertValido(dados);
    return Coordenador.create(dados);
  }

  static async update(req) {
    const { id } = req.params;
    const { nome, cpf, telefone, email, status, especialidade, login, senha } = req.body;

    const coordenador = await Coordenador.findByPk(id);
    if (!coordenador) throw new ValidationError('Coordenador não encontrado.');

    const dados = {
      nome:          nome          ?? coordenador.nome,
      cpf:           cpf           ?? coordenador.cpf,
      telefone:      telefone      ?? coordenador.telefone,
      email:         email         ?? coordenador.email,
      status:        status        ?? coordenador.status,
      especialidade: especialidade ?? coordenador.especialidade,
      login:         login         ?? coordenador.login,
      senha:         senha         ?? coordenador.senha,
    };

    await assertValido(dados);

    Object.assign(coordenador, dados);
    await coordenador.save();
    return coordenador;
  }

  static async delete(req) {
    const { id } = req.params;
    const coordenador = await Coordenador.findByPk(id);
    if (!coordenador) throw new ValidationError('Coordenador não encontrado.');
    await coordenador.destroy();
    return coordenador;
  }
}

export { CoordenadorService };
