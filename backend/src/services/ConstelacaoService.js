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
    const constelacao = await Constelacao.create({
      nome,
      hemisferio,
      periodoVisibilidade,
      principaisEstrelas,
      descricao,
      curiosidades,
    });
    return Constelacao.findByPk(constelacao.id, { include });
  }

  static async update(req) {
    const { id } = req.params;
    const constelacao = await Constelacao.findByPk(id);
    if (!constelacao) throw new Error('Constelação não encontrada.');

    const { nome, hemisferio, periodoVisibilidade, principaisEstrelas, descricao, curiosidades } =
      req.body;
    if (nome !== undefined) constelacao.nome = nome;
    if (hemisferio !== undefined) constelacao.hemisferio = hemisferio;
    if (periodoVisibilidade !== undefined) constelacao.periodoVisibilidade = periodoVisibilidade;
    if (principaisEstrelas !== undefined) constelacao.principaisEstrelas = principaisEstrelas;
    if (descricao !== undefined) constelacao.descricao = descricao;
    if (curiosidades !== undefined) constelacao.curiosidades = curiosidades;
    await constelacao.save();
    return Constelacao.findByPk(constelacao.id, { include });
  }

  static async delete(req) {
    const { id } = req.params;
    const constelacao = await Constelacao.findByPk(id, { include });
    if (!constelacao) throw new Error('Constelação não encontrada.');

    // RF11: não pode remover se vinculada a observações
    const observacaoVinculada = await Observacao.findOne({
      attributes: ['id'],
      where: { constelacaoId: id },
    });
    if (observacaoVinculada) {
      throw new Error('Não é possível remover a constelação: existem observações vinculadas.');
    }

    await constelacao.destroy();
    return constelacao;
  }
}

export { ConstelacaoService };
