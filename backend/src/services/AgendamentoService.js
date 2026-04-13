import { Op } from 'sequelize';
import sequelize from '../config/database-connection.js';
import { Agendamento } from '../models/Agendamento.js';
import { Guia } from '../models/Guia.js';
import { Caravana } from '../models/Caravana.js';
import { formatLocalDateYYYYMMDD, getTurnoFromDate } from '../utils/agendamentoTurno.js';
import { ValidationError } from '../utils/errors.js';
import { validarCampos } from '../utils/validate.js';

const MAX_AGENDAMENTOS_POR_TURNO = 3;

const include = [
  { model: Guia, as: 'guia' },
  { model: Caravana, as: 'caravana' },
];

// ─── Validação ────────────────────────────────────────────────────────────────

async function assertValido(dados, excludeId, transaction) {
  const [campoErros, regraErros] = await Promise.all([
    validarCampos(Agendamento, dados),
    errosDeNegocio(dados, excludeId, transaction),
  ]);

  const todos = [...campoErros, ...regraErros];
  if (todos.length > 0) throw new ValidationError(todos);
}

async function errosDeNegocio({ dataVisita, guiaId }, excludeId, transaction) {
  const erros = [];

  const visitDate = new Date(dataVisita);
  const dayStr = formatLocalDateYYYYMMDD(visitDate);
  const turno = getTurnoFromDate(visitDate);

  const [guia, agendamentosNoDia] = await Promise.all([
    Guia.findByPk(guiaId, { transaction }),
    Agendamento.findAll({
      attributes: ['id', 'dataVisita'],
      where: sequelize.where(sequelize.fn('date', sequelize.col('data_visita')), dayStr),
      transaction,
    }),
  ]);

  if (!guia) {
    erros.push('Guia não encontrado.');
  } else if (guia.disponibilidade !== turno) {
    erros.push(`O guia "${guia.nome}" não tem disponibilidade compatível com o horário selecionado.`);
  }

  const totalNoTurno = agendamentosNoDia.filter((row) => {
    if (excludeId != null && Number(row.id) === Number(excludeId)) return false;
    return getTurnoFromDate(row.dataVisita) === turno;
  }).length;

  if (totalNoTurno >= MAX_AGENDAMENTOS_POR_TURNO) {
    erros.push(`Não é permitido mais de ${MAX_AGENDAMENTOS_POR_TURNO} agendamentos para a mesma data no mesmo turno.`);
  }

  return erros;
}

// ─── Service ──────────────────────────────────────────────────────────────────

class AgendamentoService {
  static async findAll() {
    return Agendamento.findAll({ include, order: [['dataVisita', 'ASC']] });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Agendamento.findByPk(id, { include });
  }

  static async create(req) {
    const { dataVisita, valorVisita, observacoes, guiaId, caravanaId } = req.body;

    return sequelize.transaction(async (transaction) => {
      await assertValido(
        { dataVisita, valorVisita, observacoes, guiaId, caravanaId },
        null,
        transaction
      );

      const agendamento = await Agendamento.create(
        { dataVisita, valorVisita, observacoes, guiaId, caravanaId },
        { transaction }
      );
      return Agendamento.findByPk(agendamento.id, { include, transaction });
    });
  }

  static async update(req) {
    const { id } = req.params;
    const { dataVisita, valorVisita, observacoes, guiaId, caravanaId } = req.body;

    return sequelize.transaction(async (transaction) => {
      const agendamento = await Agendamento.findByPk(id, { transaction });
      if (!agendamento) throw new ValidationError('Agendamento não encontrado.');

      const dados = {
        dataVisita:  dataVisita  ?? agendamento.dataVisita,
        valorVisita: valorVisita ?? agendamento.valorVisita,
        observacoes: observacoes ?? agendamento.observacoes,
        guiaId:      guiaId      ?? agendamento.guiaId,
        caravanaId:  caravanaId  ?? agendamento.caravanaId,
      };

      await assertValido(dados, Number(id), transaction);

      Object.assign(agendamento, dados);
      await agendamento.save({ transaction });
      return Agendamento.findByPk(agendamento.id, { include, transaction });
    });
  }

  static async delete(req) {
    const { id } = req.params;
    const agendamento = await Agendamento.findByPk(id);
    if (!agendamento) throw new ValidationError('Agendamento não encontrado.');
    await agendamento.destroy();
    return agendamento;
  }
}

export { AgendamentoService };
