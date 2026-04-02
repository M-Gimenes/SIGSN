import { Op, UniqueConstraintError } from 'sequelize';
import { Observacao } from '../models/Observacao.js';
import { Projeto } from '../models/Projeto.js';
import { Constelacao } from '../models/Constelacao.js';

const include = [
  { model: Projeto, as: 'projeto' },
  { model: Constelacao, as: 'constelacao' },
];

async function proximaVersao(projetoId, constelacaoId, excludeId) {
  const max = await Observacao.max('versaoObservacao', {
    where: {
      projetoId,
      constelacaoId,
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    },
  });
  const n = max == null || max === '' ? 0 : Number(max);
  return Number.isFinite(n) ? n + 1 : 1;
}

class ObservacaoService {
  /**
   * Doc RF35–RF38: apenas existência de projeto e constelação; demais regras = duplicidade + versão automática.
   */
  static async _validarReferencias(projetoId, constelacaoId) {
    if (!constelacaoId) {
      throw new Error('Constelação observada deve ser informada.');
    }
    const projeto = await Projeto.findByPk(projetoId);
    if (!projeto) throw new Error('Projeto não encontrado.');
    const constelacao = await Constelacao.findByPk(constelacaoId);
    if (!constelacao) throw new Error('Constelação não encontrada.');
  }

  static async findAll(req) {
    return Observacao.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Observacao.findByPk(id, { include });
  }

  static async create(req) {
    const { dataObservacao, descricao, instrumentoUtilizado, projetoId, constelacaoId } = req.body;

    await this._validarReferencias(projetoId, constelacaoId);

    const versaoObservacao = await proximaVersao(projetoId, constelacaoId, null);

    try {
      const obj = await Observacao.create({
        dataObservacao,
        descricao,
        instrumentoUtilizado,
        versaoObservacao,
        projetoId,
        constelacaoId,
      });
      return Observacao.findByPk(obj.id, { include });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new Error(
          'Não é permitido registrar duas observações da mesma constelação no mesmo dia associadas ao mesmo projeto de pesquisa.'
        );
      }
      throw error;
    }
  }

  static async update(req) {
    const { id } = req.params;
    const obj = await Observacao.findByPk(id);
    if (!obj) throw new Error('Observação não encontrada.');

    const {
      dataObservacao,
      descricao,
      instrumentoUtilizado,
      projetoId,
      constelacaoId,
    } = req.body;

    const nextProjetoId = projetoId !== undefined ? projetoId : obj.projetoId;
    const nextConstId = constelacaoId !== undefined ? constelacaoId : obj.constelacaoId;

    await this._validarReferencias(nextProjetoId, nextConstId);

    let versaoObservacao = obj.versaoObservacao;
    if (nextProjetoId !== obj.projetoId || nextConstId !== obj.constelacaoId) {
      versaoObservacao = await proximaVersao(nextProjetoId, nextConstId, Number(id));
    }

    try {
      if (dataObservacao !== undefined) obj.dataObservacao = dataObservacao;
      if (descricao !== undefined) obj.descricao = descricao;
      if (instrumentoUtilizado !== undefined) obj.instrumentoUtilizado = instrumentoUtilizado;
      obj.versaoObservacao = versaoObservacao;
      obj.projetoId = nextProjetoId;
      obj.constelacaoId = nextConstId;
      await obj.save();
      return Observacao.findByPk(obj.id, { include });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new Error(
          'Não é permitido registrar duas observações da mesma constelação no mesmo dia associadas ao mesmo projeto de pesquisa.'
        );
      }
      throw error;
    }
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Observacao.findByPk(id);
    if (!obj) throw new Error('Observação não encontrada.');
    try {
      await obj.destroy();
      return obj;
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        throw new Error('Não é possível remover a observação devido a restrições no banco.');
      }
      throw error;
    }
  }
}

export { ObservacaoService };
