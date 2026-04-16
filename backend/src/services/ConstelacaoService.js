import { Constelacao } from '../models/Constelacao.js';
import { ValidationError } from '../utils/errors.js';
import { validarCampos } from '../utils/validate.js';
import { Observacao } from '../models/Observacao.js';

// Emanuelly - Cadastro

const include = [{ model: Observacao, as: 'observacoes' }];

// ─── Validação ────────────────────────────────────────────────────────────────

async function assertValido(dados) {
  const erros = await validarCampos(Constelacao, dados);
  if (erros.length > 0) throw new ValidationError(erros);
}

// ─── Service ──────────────────────────────────────────────────────────────────

class ConstelacaoService {
  static async findAll() {
    return Constelacao.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Constelacao.findByPk(id, { include });
  }

  static async create(req) {
    const { nome, hemisferio, periodoVisibilidade, principaisEstrelas, descricao, curiosidades } = req.body;
    const dados = { nome, hemisferio, periodoVisibilidade, principaisEstrelas, descricao, curiosidades };

    await assertValido(dados);
    const constelacao = await Constelacao.create(dados);
    return Constelacao.findByPk(constelacao.id, { include });
  }

  static async update(req) {
    const { id } = req.params;
    const { nome, hemisferio, periodoVisibilidade, principaisEstrelas, descricao, curiosidades } = req.body;

    const constelacao = await Constelacao.findByPk(id);
    if (!constelacao) throw new ValidationError('Constelação não encontrada.');

    const dados = {
      nome:                nome                ?? constelacao.nome,
      hemisferio:          hemisferio          ?? constelacao.hemisferio,
      periodoVisibilidade: periodoVisibilidade ?? constelacao.periodoVisibilidade,
      principaisEstrelas:  principaisEstrelas  ?? constelacao.principaisEstrelas,
      descricao:           descricao           ?? constelacao.descricao,
      curiosidades:        curiosidades        ?? constelacao.curiosidades,
    };

    await assertValido(dados);

    Object.assign(constelacao, dados);
    await constelacao.save();
    return Constelacao.findByPk(constelacao.id, { include });
  }

  static async delete(req) {
    const { id } = req.params;
    const constelacao = await Constelacao.findByPk(id);
    if (!constelacao) throw new ValidationError('Constelação não encontrada.');
    await constelacao.destroy();
    return constelacao;
  }
}

export { ConstelacaoService };
