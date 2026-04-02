import { UniqueConstraintError } from 'sequelize';
import sequelize from '../config/database-connection.js';
import { Agendamento } from '../models/Agendamento.js';
import { Guia } from '../models/Guia.js';
import { Coordenador } from '../models/Coordenador.js';
import { Caravana } from '../models/Caravana.js';
import { formatLocalDateYYYYMMDD, getTurnoFromDate } from '../utils/agendamentoTurno.js';

const MAX_AGENDAMENTOS_POR_TURNO_DIA = 3;

const include = [
  { model: Guia, as: 'guia' },
  { model: Coordenador, as: 'coordenador' },
  { model: Caravana, as: 'caravana' },
];

/**
 * Doc RF27–RF30: (1) não repetir data+horário; (2) no máx. 3 agendamentos na mesma data no mesmo turno.
 */
async function assertLimiteTurno(dataVisita, excludeId) {
  const visitDate = new Date(dataVisita);
  const dayStr = formatLocalDateYYYYMMDD(visitDate);
  const turno = getTurnoFromDate(visitDate);

  const noDia = await Agendamento.findAll({
    attributes: ['id', 'dataVisita'],
    where: sequelize.where(sequelize.fn('date', sequelize.col('data_visita')), dayStr),
  });

  const count = noDia.filter((row) => {
    if (excludeId != null && Number(row.id) === Number(excludeId)) return false;
    return getTurnoFromDate(row.dataVisita) === turno;
  }).length;

  if (count >= MAX_AGENDAMENTOS_POR_TURNO_DIA) {
    throw new Error(
      `Não é permitido mais de ${MAX_AGENDAMENTOS_POR_TURNO_DIA} agendamentos para a mesma data no mesmo turno.`
    );
  }
}

class AgendamentoService {
  static async findAll(req) {
    return Agendamento.findAll({ include });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Agendamento.findByPk(id, { include });
  }

  static async create(req) {
    const {
      dataVisita,
      tipoVisita,
      valorVisita,
      observacoes,
      guiaId,
      coordenadorId,
      caravanaId,
    } = req.body;

    await assertLimiteTurno(dataVisita, null);

    try {
      const obj = await Agendamento.create({
        dataVisita,
        tipoVisita,
        valorVisita,
        observacoes,
        guiaId,
        coordenadorId,
        caravanaId,
      });
      return Agendamento.findByPk(obj.id, { include });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new Error(
          'Não é permitido o agendamento: já existe outro cadastrado para a mesma data e horário de visita.'
        );
      }
      throw error;
    }
  }

  static async update(req) {
    const { id } = req.params;
    const obj = await Agendamento.findByPk(id);
    if (!obj) throw new Error('Agendamento não encontrado.');

    const {
      dataVisita,
      tipoVisita,
      valorVisita,
      observacoes,
      guiaId,
      coordenadorId,
      caravanaId,
    } = req.body;

    const nextData = dataVisita !== undefined ? dataVisita : obj.dataVisita;

    await assertLimiteTurno(nextData, id);

    try {
      if (dataVisita !== undefined) obj.dataVisita = dataVisita;
      if (tipoVisita !== undefined) obj.tipoVisita = tipoVisita;
      if (valorVisita !== undefined) obj.valorVisita = valorVisita;
      if (observacoes !== undefined) obj.observacoes = observacoes;
      if (guiaId !== undefined) obj.guiaId = guiaId;
      if (coordenadorId !== undefined) obj.coordenadorId = coordenadorId;
      if (caravanaId !== undefined) obj.caravanaId = caravanaId;
      await obj.save();
      return Agendamento.findByPk(obj.id, { include });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new Error(
          'Não é permitido o agendamento: já existe outro cadastrado para a mesma data e horário de visita.'
        );
      }
      throw error;
    }
  }

  static async delete(req) {
    const { id } = req.params;
    const obj = await Agendamento.findByPk(id);
    if (!obj) throw new Error('Agendamento não encontrado.');
    await obj.destroy();
    return obj;
  }
}

export { AgendamentoService };
