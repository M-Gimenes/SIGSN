import sequelize from '../config/database-connection.js';
import { Agendamento } from '../models/Agendamento.js';
import { Guia } from '../models/Guia.js';
import { Caravana } from '../models/Caravana.js';
import { formatLocalDateYYYYMMDD, getTurnoFromDate } from '../utils/agendamentoTurno.js';
import { ValidationError } from '../utils/errors.js';
import { validarCampos } from '../utils/validate.js';

// Larissa - Processo

const MAX_AGENDAMENTOS_POR_TURNO = 3;

const include = [
  { model: Guia, as: 'guia' },
  { model: Caravana, as: 'caravana' },
];

// ─── Regras ───────────────────────────────────────────────────────────────────

//Regra 1
async function validarDisponibilidadeGuia(guia, turno) {
  if (guia.disponibilidade !== turno) {
    throw new ValidationError(
      `O guia "${guia.nome}" não tem disponibilidade compatível com o horário selecionado.`
    );
  }
}

//Regra 2
async function validarLimiteAgendamentosPorTurno(visitDate, turno, excludeId, transaction) {
  const dayStr = formatLocalDateYYYYMMDD(visitDate);
  const agendamentosNoDia = await Agendamento.findAll({
    attributes: ['id', 'dataVisita'],
    where: sequelize.where(sequelize.fn('date', sequelize.col('data_visita')), dayStr),
    transaction,
  });
  const totalNoTurno = agendamentosNoDia.filter((row) => {
    if (excludeId != null && Number(row.id) === Number(excludeId)) return false;
    return getTurnoFromDate(row.dataVisita) === turno;
  }).length;
  if (totalNoTurno >= MAX_AGENDAMENTOS_POR_TURNO) {
    throw new ValidationError(
      `Não é permitido mais de ${MAX_AGENDAMENTOS_POR_TURNO} agendamentos para a mesma data no mesmo turno.`
    );
  }
}

async function validarRegrasDeNegocio(dados, excludeId, transaction) {
  const erros = await validarCampos(Agendamento, dados);

  const guia = await Guia.findByPk(dados.guiaId, { transaction });
  if (!guia) erros.push('Guia não encontrado.');

  if (erros.length) throw new ValidationError(erros);

  const visitDate = new Date(dados.dataVisita);
  const turno = getTurnoFromDate(visitDate);

  await validarDisponibilidadeGuia(guia, turno);
  await validarLimiteAgendamentosPorTurno(visitDate, turno, excludeId, transaction);
}

// ─── Service ──────────────────────────────────────────────────────────────────

class AgendamentoService {
  static async findAll() {
    return Agendamento.findAll({ include, order: [['dataVisita', 'ASC']] });
  }

  static async findByPk(req) {
    return Agendamento.findByPk(req.params.id, { include });
  }

  static async create(req) {
    const { dataVisita, valorVisita, observacoes, guiaId, caravanaId } = req.body;
    const dados = { dataVisita, valorVisita, observacoes, guiaId, caravanaId };

    return sequelize.transaction(async (transaction) => {
      await validarRegrasDeNegocio(dados, null, transaction);
      const { id } = await Agendamento.create(dados, { transaction });
      return Agendamento.findByPk(id, { include, transaction });
    });
  }

  static async update(req) {
    const id = Number(req.params.id);

    return sequelize.transaction(async (transaction) => {
      const agendamento = await Agendamento.findByPk(id, { transaction });
      if (!agendamento) throw new ValidationError('Agendamento não encontrado.');

      const dados = {
        dataVisita:  req.body.dataVisita  ?? agendamento.dataVisita,
        valorVisita: req.body.valorVisita ?? agendamento.valorVisita,
        observacoes: req.body.observacoes ?? agendamento.observacoes,
        guiaId:      req.body.guiaId      ?? agendamento.guiaId,
        caravanaId:  req.body.caravanaId  ?? agendamento.caravanaId,
      };

      await validarRegrasDeNegocio(dados, id, transaction);

      await agendamento.update(dados, { transaction });
      return Agendamento.findByPk(id, { include, transaction });
    });
  }

  static async delete(req) {
    const agendamento = await Agendamento.findByPk(req.params.id);
    if (!agendamento) throw new ValidationError('Agendamento não encontrado.');
    await agendamento.destroy();
    return agendamento;
  }
}

export { AgendamentoService };
