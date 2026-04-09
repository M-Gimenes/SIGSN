import { Op, UniqueConstraintError } from 'sequelize';
import sequelize from '../config/database-connection.js';
import { Observacao } from '../models/Observacao.js';
import { Projeto } from '../models/Projeto.js';
import { Constelacao } from '../models/Constelacao.js';

const include = [
  { model: Projeto, as: 'projeto' },
  { model: Constelacao, as: 'constelacao' },
];

/**
 * Calcula a próxima versão para a combinação projeto+constelação dentro da transação,
 * evitando race conditions ao ler e escrever sob o mesmo lock.
 */
async function proximaVersao(projetoId, constelacaoId, excludeId, transaction) {
  const max = await Observacao.max('versaoObservacao', {
    where: {
      projetoId,
      constelacaoId,
      ...(excludeId != null ? { id: { [Op.ne]: excludeId } } : {}),
    },
    transaction,
  });
  const n = max == null ? 0 : Number(max);
  return Number.isFinite(n) ? n + 1 : 1;
}

async function validarReferencias(projetoId, constelacaoId, transaction) {
  if (!constelacaoId) throw new Error('Constelação observada deve ser informada.');

  const projeto = await Projeto.findByPk(projetoId, { transaction });
  if (!projeto) throw new Error('Projeto não encontrado.');

  const constelacao = await Constelacao.findByPk(constelacaoId, { transaction });
  if (!constelacao) throw new Error('Constelação não encontrada.');
}

class ObservacaoService {
  static async findAll() {
    return Observacao.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Observacao.findByPk(id, { include });
  }

  /**
   * RF35: versão calculada automaticamente; RF38: não permite duplicata constelação+projeto+dia.
   */
  static async create(req) {
    const { dataObservacao, descricao, instrumentoUtilizado, projetoId, constelacaoId } = req.body;

    return sequelize.transaction(async (t) => {
      await validarReferencias(projetoId, constelacaoId, t);

      const versaoObservacao = await proximaVersao(projetoId, constelacaoId, null, t);

      try {
        const obj = await Observacao.create(
          { dataObservacao, descricao, instrumentoUtilizado, versaoObservacao, projetoId, constelacaoId },
          { transaction: t }
        );
        return Observacao.findByPk(obj.id, { include, transaction: t });
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          throw new Error(
            'Não é permitido registrar duas observações da mesma constelação no mesmo dia associadas ao mesmo projeto.'
          );
        }
        throw error;
      }
    });
  }

  static async update(req) {
    const { id } = req.params;
    const { dataObservacao, descricao, instrumentoUtilizado, projetoId, constelacaoId } = req.body;

    return sequelize.transaction(async (t) => {
      const obj = await Observacao.findByPk(id, { transaction: t });
      if (!obj) throw new Error('Observação não encontrada.');

      const nextProjetoId = projetoId !== undefined ? projetoId : obj.projetoId;
      const nextConstelacaoId = constelacaoId !== undefined ? constelacaoId : obj.constelacaoId;

      await validarReferencias(nextProjetoId, nextConstelacaoId, t);

      // Recalcula a versão apenas se mudar de projeto ou constelação
      let versaoObservacao = obj.versaoObservacao;
      if (nextProjetoId !== obj.projetoId || nextConstelacaoId !== obj.constelacaoId) {
        versaoObservacao = await proximaVersao(nextProjetoId, nextConstelacaoId, Number(id), t);
      }

      try {
        if (dataObservacao !== undefined) obj.dataObservacao = dataObservacao;
        if (descricao !== undefined) obj.descricao = descricao;
        if (instrumentoUtilizado !== undefined) obj.instrumentoUtilizado = instrumentoUtilizado;
        obj.versaoObservacao = versaoObservacao;
        obj.projetoId = nextProjetoId;
        obj.constelacaoId = nextConstelacaoId;
        await obj.save({ transaction: t });
        return Observacao.findByPk(obj.id, { include, transaction: t });
      } catch (error) {
        if (error instanceof UniqueConstraintError) {
          throw new Error(
            'Não é permitido registrar duas observações da mesma constelação no mesmo dia associadas ao mesmo projeto.'
          );
        }
        throw error;
      }
    });
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Observacao.findByPk(id);
    if (!obj) throw new Error('Observação não encontrada.');
    await obj.destroy();
    return obj;
  }
}

export { ObservacaoService };
