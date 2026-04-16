import { Op } from 'sequelize';
import sequelize from '../config/database-connection.js';
import { Observacao } from '../models/Observacao.js';
import { Projeto } from '../models/Projeto.js';
import { Constelacao } from '../models/Constelacao.js';
import { ValidationError } from '../utils/errors.js';
import { validarCampos } from '../utils/validate.js';

// Emanuelly - Processo

const MAX_OBSERVACOES_POR_DIA = 2;

const include = [
  { model: Projeto, as: 'projeto' },
  { model: Constelacao, as: 'constelacao' },
];

// ─── Validação ────────────────────────────────────────────────────────────────

async function assertValido(dados, excludeId, transaction) {
  const [campoErros, regraErros] = await Promise.all([
    validarCampos(Observacao, dados),
    verificarRegrasDeNegocio(dados, excludeId, transaction),
  ]);

  const todos = [...campoErros, ...regraErros];
  if (todos.length > 0) throw new ValidationError(todos);
}

async function verificarConstelacaoInformada(constelacaoId) {
  const erros = [];
  // Regra de negócio: constelação deve ser informada
  if (!constelacaoId) erros.push('Constelação observada deve ser informada.');
  return erros;
}

async function verificarExistenciaProjetoEConstelacao(projetoId, constelacaoId, transaction) {
  const erros = [];
  // Regra de negócio: projeto e constelação informados devem existir
  const [projeto, constelacao] = await Promise.all([
    Projeto.findByPk(projetoId, { transaction }),
    constelacaoId ? Constelacao.findByPk(constelacaoId, { transaction }) : Promise.resolve(null),
  ]);
  if (!projeto) erros.push('Projeto não encontrado.');
  if (constelacaoId && !constelacao) erros.push('Constelação não encontrada.');
  return erros;
}

async function verificarLimiteObservacoesDiarias(projetoId, constelacaoId, dataObservacao, excludeId, transaction) {
  const erros = [];
  // Regra de negócio: limite de observações da mesma constelação pelo mesmo projeto no mesmo dia
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
    erros.push(
      `Não é permitido registrar mais de ${MAX_OBSERVACOES_POR_DIA} observações da mesma constelação no mesmo dia associadas ao mesmo projeto.`
    );
  }
  return erros;
}

async function verificarRegrasDeNegocio({ dataObservacao, projetoId, constelacaoId }, excludeId, transaction) {
  const [errosConstelacao, errosExistencia] = await Promise.all([
    verificarConstelacaoInformada(constelacaoId),
    verificarExistenciaProjetoEConstelacao(projetoId, constelacaoId, transaction),
  ]);

  const errosLimite = errosConstelacao.length === 0 && errosExistencia.length === 0
    ? await verificarLimiteObservacoesDiarias(projetoId, constelacaoId, dataObservacao, excludeId, transaction)
    : [];

  return [...errosConstelacao, ...errosExistencia, ...errosLimite];
}

// ─── Versão ───────────────────────────────────────────────────────────────────

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

// ─── Service ──────────────────────────────────────────────────────────────────

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
      await assertValido(
        { dataObservacao, descricao, instrumentoUtilizado, projetoId, constelacaoId },
        null,
        transaction
      );

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
      if (!observacao) throw new ValidationError('Observação não encontrada.');

      const dados = {
        dataObservacao:       dataObservacao       ?? observacao.dataObservacao,
        descricao:            descricao            ?? observacao.descricao,
        instrumentoUtilizado: instrumentoUtilizado ?? observacao.instrumentoUtilizado,
        projetoId:            projetoId            ?? observacao.projetoId,
        constelacaoId:        constelacaoId        ?? observacao.constelacaoId,
      };

      await assertValido(dados, Number(id), transaction);

      const mudouVinculo = dados.projetoId !== observacao.projetoId
        || dados.constelacaoId !== observacao.constelacaoId;

      const versaoObservacao = mudouVinculo
        ? await proximaVersao(dados.projetoId, dados.constelacaoId, Number(id), transaction)
        : observacao.versaoObservacao;

      Object.assign(observacao, { ...dados, versaoObservacao });
      await observacao.save({ transaction });
      return Observacao.findByPk(observacao.id, { include, transaction });
    });
  }

  static async delete(req) {
    const { id } = req.params;
    const observacao = await Observacao.findByPk(id);
    if (!observacao) throw new ValidationError('Observação não encontrada.');
    await observacao.destroy();
    return observacao;
  }
}

export { ObservacaoService };
