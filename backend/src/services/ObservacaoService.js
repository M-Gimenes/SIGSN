import { Op } from 'sequelize';
import sequelize from '../config/database-connection.js';
import { Observacao } from '../models/Observacao.js';
import { Projeto } from '../models/Projeto.js';
import { Constelacao } from '../models/Constelacao.js';
import { ValidationError } from '../utils/errors.js';
import { validarCampos } from '../utils/validate.js';

// Emanuelly - Processo

const MAX_POR_DIA = 2;
const include = [
  { model: Projeto, as: 'projeto' },
  { model: Constelacao, as: 'constelacao' },
];

const escopoVinculo = ({ projetoId, constelacaoId }, excludeId) => ({
  projetoId,
  constelacaoId,
  ...(excludeId != null && { id: { [Op.ne]: excludeId } }),
});

// ─── Regras ───────────────────────────────────────────────────────────────────

//Regra 1
async function validarLimiteDiario(dados, excludeId, transaction) {
  const total = await Observacao.count({
    where: { ...escopoVinculo(dados, excludeId), dataObservacao: dados.dataObservacao },
    transaction,
  });
  if (total >= MAX_POR_DIA) {
    throw new ValidationError(
      `Não é permitido registrar mais de ${MAX_POR_DIA} observações da mesma constelação no mesmo dia associadas ao mesmo projeto.`
    );
  }
}

// ─── Versionamento ────────────────────────────────────────────────────────────

// Regra 2: versão é sequencial por (projeto, constelação).
async function calcularProximaVersao(dados, excludeId, transaction) {
  const max = Number(await Observacao.max('versaoObservacao', {
    where: escopoVinculo(dados, excludeId),
    transaction,
  }));
  return Number.isFinite(max) ? max + 1 : 1;
}

async function validarRegrasDeNegocio(dados, excludeId, transaction) {
  const erros = await validarCampos(Observacao, dados);
  if (!dados.constelacaoId) erros.push('Constelação observada deve ser informada.');

  const [projeto, constelacao] = await Promise.all([
    Projeto.findByPk(dados.projetoId, { transaction }),
    dados.constelacaoId && Constelacao.findByPk(dados.constelacaoId, { transaction }),
  ]);
  if (!projeto) erros.push('Projeto não encontrado.');
  if (dados.constelacaoId && !constelacao) erros.push('Constelação não encontrada.');

  if (erros.length) throw new ValidationError(erros);

  await validarLimiteDiario(dados, excludeId, transaction);
}

// ─── Service ──────────────────────────────────────────────────────────────────

class ObservacaoService {
  static async findAll() {
    return Observacao.findAll({ include });
  }

  static async findByPk(req) {
    return Observacao.findByPk(req.params.id, { include });
  }

  static async create(req) {
    const { dataObservacao, descricao, instrumentoUtilizado, projetoId, constelacaoId } = req.body;
    const dados = { dataObservacao, descricao, instrumentoUtilizado, projetoId, constelacaoId };

    return sequelize.transaction(async (transaction) => {
      await validarRegrasDeNegocio(dados, null, transaction);
      const versaoObservacao = await calcularProximaVersao(dados, null, transaction);
      const { id } = await Observacao.create({ ...dados, versaoObservacao }, { transaction });
      return Observacao.findByPk(id, { include, transaction });
    });
  }

  static async update(req) {
    const id = Number(req.params.id);

    return sequelize.transaction(async (transaction) => {
      const observacao = await Observacao.findByPk(id, { transaction });
      if (!observacao) throw new ValidationError('Observação não encontrada.');

      const dados = {
        dataObservacao:       req.body.dataObservacao       ?? observacao.dataObservacao,
        descricao:            req.body.descricao            ?? observacao.descricao,
        instrumentoUtilizado: req.body.instrumentoUtilizado ?? observacao.instrumentoUtilizado,
        projetoId:            req.body.projetoId            ?? observacao.projetoId,
        constelacaoId:        req.body.constelacaoId        ?? observacao.constelacaoId,
      };

      await validarRegrasDeNegocio(dados, id, transaction);

      const mudouVinculo = dados.projetoId !== observacao.projetoId
        || dados.constelacaoId !== observacao.constelacaoId;
      const versaoObservacao = mudouVinculo
        ? await calcularProximaVersao(dados, id, transaction)
        : observacao.versaoObservacao;

      await observacao.update({ ...dados, versaoObservacao }, { transaction });
      return Observacao.findByPk(id, { include, transaction });
    });
  }

  static async delete(req) {
    const observacao = await Observacao.findByPk(req.params.id);
    if (!observacao) throw new ValidationError('Observação não encontrada.');
    await observacao.destroy();
    return observacao;
  }
}

export { ObservacaoService };
