import { Pesquisador } from '../models/Pesquisador.js';
import { ValidationError } from '../utils/errors.js';
import { validarCampos } from '../utils/validate.js';
import { GrupoDePesquisa } from '../models/GrupoDePesquisa.js';

// Matheus - Cadastro

const include = [
  {
    model: GrupoDePesquisa,
    as: 'gruposDePesquisa',
    through: { attributes: [] },
  },
];

// ─── Validação ────────────────────────────────────────────────────────────────

async function assertValido(dados) {
  const erros = await validarCampos(Pesquisador, dados);
  if (erros.length > 0) throw new ValidationError(erros);
}

// ─── Service ──────────────────────────────────────────────────────────────────

class PesquisadorService {
  static async findAll() {
    return Pesquisador.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Pesquisador.findByPk(id, { include });
  }

  static async create(req) {
    const { nome, cpf, telefone, email, status, especialidade, login, senha } = req.body;
    const dados = { nome, cpf, telefone, email, status, especialidade, login, senha };

    await assertValido(dados);
    const pesquisador = await Pesquisador.create(dados);
    return Pesquisador.findByPk(pesquisador.id, { include });
  }

  static async update(req) {
    const { id } = req.params;
    const { nome, cpf, telefone, email, status, especialidade, login, senha } = req.body;

    const pesquisador = await Pesquisador.findByPk(id);
    if (!pesquisador) throw new ValidationError('Pesquisador não encontrado.');

    const dados = {
      nome:          nome          ?? pesquisador.nome,
      cpf:           cpf           ?? pesquisador.cpf,
      telefone:      telefone      ?? pesquisador.telefone,
      email:         email         ?? pesquisador.email,
      status:        status        ?? pesquisador.status,
      especialidade: especialidade ?? pesquisador.especialidade,
      login:         login         ?? pesquisador.login,
      senha:         senha         ?? pesquisador.senha,
    };

    await assertValido(dados);

    Object.assign(pesquisador, dados);
    await pesquisador.save();
    return Pesquisador.findByPk(pesquisador.id, { include });
  }

  static async delete(req) {
    const { id } = req.params;
    const pesquisador = await Pesquisador.findByPk(id);
    if (!pesquisador) throw new ValidationError('Pesquisador não encontrado.');
    await pesquisador.destroy();
    return pesquisador;
  }
}

export { PesquisadorService };
