import { Constelacao } from '../models/Constelacao.js';
import { Observacao } from '../models/Observacao.js';

const include = [{ model: Observacao, as: 'observacoes' }];

class ConstelacaoService {
  static async findAll() {
    return Constelacao.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Constelacao.findByPk(id, { include });
  }

  static async create(req) {
    const { nome, hemisferio, periodoVisibilidade, principaisEstrelas, descricao, curiosidades } =
      req.body;
    const obj = await Constelacao.create({
      nome,
      hemisferio,
      periodoVisibilidade,
      principaisEstrelas,
      descricao,
      curiosidades,
    });
    return Constelacao.findByPk(obj.id, { include });
  }

  static async update(req) {
    const { id } = req.params;
    const obj = await Constelacao.findByPk(id);
    if (!obj) throw new Error('Constelação não encontrada.');

    const { nome, hemisferio, periodoVisibilidade, principaisEstrelas, descricao, curiosidades } =
      req.body;
    if (nome !== undefined) obj.nome = nome;
    if (hemisferio !== undefined) obj.hemisferio = hemisferio;
    if (periodoVisibilidade !== undefined) obj.periodoVisibilidade = periodoVisibilidade;
    if (principaisEstrelas !== undefined) obj.principaisEstrelas = principaisEstrelas;
    if (descricao !== undefined) obj.descricao = descricao;
    if (curiosidades !== undefined) obj.curiosidades = curiosidades;
    await obj.save();
    return Constelacao.findByPk(obj.id, { include });
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Constelacao.findByPk(id, { include });
    if (!obj) throw new Error('Constelação não encontrada.');

    // RF11: não pode remover se vinculada a observações
    if (obj.observacoes && obj.observacoes.length > 0) {
      throw new Error('Não é possível remover a constelação: existem observações vinculadas.');
    }

    await obj.destroy();
    return obj;
  }
}

export { ConstelacaoService };
