import { Op } from 'sequelize';
import sequelize from '../config/database-connection.js';
import { Observacao } from '../models/Observacao.js';
import { Projeto } from '../models/Projeto.js';
import { Constelacao } from '../models/Constelacao.js';

const MAX_OBSERVACOES_POR_DIA = 2;

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
  const maxVersao = max == null ? 0 : Number(max);
  return Number.isFinite(maxVersao) ? maxVersao + 1 : 1;
}

/**
 * RF35/RF38: valida todas as regras de negócio da observação.
 * - Projeto e constelação devem existir.
 * - Máx. 2 observações da mesma constelação no mesmo dia para o mesmo projeto.
 * Deve ser chamada dentro de uma transação para evitar race conditions.
 */
async function assertRegrasNegocio({ dataObservacao, projetoId, constelacaoId }, excludeId, transaction) {
  if (!constelacaoId) throw new Error('Constelação observada deve ser informada.');

  const projeto = await Projeto.findByPk(projetoId, { transaction });
  if (!projeto) throw new Error('Projeto não encontrado.');

  const constelacao = await Constelacao.findByPk(constelacaoId, { transaction });
  if (!constelacao) throw new Error('Constelação não encontrada.');

  const totalNoDia = await Observacao.count({
    where: {
      projetoId,
      constelacaoId,
      dataObservacao,
      ...(excludeId != null ? { id: { [Op.ne]: excludeId } } : {}),
    },
    transaction,
  });

  if (totalNoDia >= MAX_OBSERVACOES_POR_DIA) {
    throw new Error(
      `Não é permitido registrar mais de ${MAX_OBSERVACOES_POR_DIA} observações da mesma constelação no mesmo dia associadas ao mesmo projeto.`
    );
  }
}

class ObservacaoService {
  static async findAll() {
    return Observacao.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Observacao.findByPk(id, { include });
  }

  static async create(req) {
    const { dataObservacao, descricao, instrumentoUtilizado, projetoId, constelacaoId } = req.body;

    return sequelize.transaction(async (transaction) => {
      await assertRegrasNegocio({ dataObservacao, projetoId, constelacaoId }, null, transaction);

      const versaoObservacao = await proximaVersao(projetoId, constelacaoId, null, transaction);

      const observacao = await Observacao.create(
        { dataObservacao, descricao, instrumentoUtilizado, versaoObservacao, projetoId, constelacaoId },
        { transaction }
      );
      return Observacao.findByPk(observacao.id, { include, transaction });
    });
  }

  static async update(req) {
    const { id } = req.params;
    const { dataObservacao, descricao, instrumentoUtilizado, projetoId, constelacaoId } = req.body;

    return sequelize.transaction(async (transaction) => {
      const observacao = await Observacao.findByPk(id, { transaction });
      if (!observacao) throw new Error('Observação não encontrada.');

      const nextDataObservacao = dataObservacao !== undefined ? dataObservacao : observacao.dataObservacao;
      const nextProjetoId = projetoId !== undefined ? projetoId : observacao.projetoId;
      const nextConstelacaoId = constelacaoId !== undefined ? constelacaoId : observacao.constelacaoId;

      await assertRegrasNegocio(
        { dataObservacao: nextDataObservacao, projetoId: nextProjetoId, constelacaoId: nextConstelacaoId },
        Number(id),
        transaction
      );

      // Recalcula a versão apenas se mudar de projeto ou constelação
      let versaoObservacao = observacao.versaoObservacao;
      if (nextProjetoId !== observacao.projetoId || nextConstelacaoId !== observacao.constelacaoId) {
        versaoObservacao = await proximaVersao(nextProjetoId, nextConstelacaoId, Number(id), transaction);
      }

      if (dataObservacao !== undefined) observacao.dataObservacao = dataObservacao;
      if (descricao !== undefined) observacao.descricao = descricao;
      if (instrumentoUtilizado !== undefined) observacao.instrumentoUtilizado = instrumentoUtilizado;
      observacao.versaoObservacao = versaoObservacao;
      observacao.projetoId = nextProjetoId;
      observacao.constelacaoId = nextConstelacaoId;
      await observacao.save({ transaction });
      return Observacao.findByPk(observacao.id, { include, transaction });
    });
  }

  static async delete(req) {
    const { id } = req.params;
    const observacao = await Observacao.findByPk(id);
    if (!observacao) throw new Error('Observação não encontrada.');
    await observacao.destroy();
    return observacao;
  }
}

export { ObservacaoService };
