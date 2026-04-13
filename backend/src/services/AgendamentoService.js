import sequelize from '../config/database-connection.js';
import { Agendamento } from '../models/Agendamento.js';
import { Guia } from '../models/Guia.js';
import { Caravana } from '../models/Caravana.js';
import { formatLocalDateYYYYMMDD, getTurnoFromDate, isGuiaDisponivel } from '../utils/agendamentoTurno.js';

const MAX_AGENDAMENTOS_POR_TURNO = 3;

const include = [
  { model: Guia, as: 'guia' },
  { model: Caravana, as: 'caravana' },
];

/**
 * RF27–RF30:
 * - Guia deve existir e ter disponibilidade compatível com o horário.
 * - Máx. 3 agendamentos na mesma data e turno.
 */
async function assertRegrasNegocio({ dataVisita, guiaId }, excludeId, transaction) {
  const guia = await Guia.findByPk(guiaId, { transaction });
  if (!guia) throw new Error('Guia não encontrado.');
  if (!isGuiaDisponivel(guia.disponibilidade, dataVisita)) {
    throw new Error(
      `O guia "${guia.nome}" não tem disponibilidade compatível com o horário selecionado.`
    );
  }

  const visitDate = new Date(dataVisita);
  const dayStr = formatLocalDateYYYYMMDD(visitDate);
  const turno = getTurnoFromDate(visitDate);

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
    throw new Error(
      `Não é permitido mais de ${MAX_AGENDAMENTOS_POR_TURNO} agendamentos para a mesma data no mesmo turno.`
    );
  }
}

class AgendamentoService {
  static async findAll() {
    return Agendamento.findAll({ include, order: [['dataVisita', 'ASC']] });
  }

  static async findByPk(req) {
    const { id } = req.params;
    return Agendamento.findByPk(id, { include });
  }

  static async create(req) {
    const { dataVisita, tipoVisita, valorVisita, observacoes, guiaId, caravanaId } = req.body;

    return sequelize.transaction(async (transaction) => {
      await assertRegrasNegocio({ dataVisita, guiaId }, null, transaction);

      const agendamento = await Agendamento.create(
        { dataVisita, tipoVisita, valorVisita, observacoes, guiaId, caravanaId },
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
      if (!agendamento) throw new Error('Agendamento não encontrado.');

      const nextDataVisita = dataVisita !== undefined ? dataVisita : agendamento.dataVisita;
      const nextGuiaId = guiaId !== undefined ? guiaId : agendamento.guiaId;

      await assertRegrasNegocio({ dataVisita: nextDataVisita, guiaId: nextGuiaId }, Number(id), transaction);

      if (dataVisita !== undefined) agendamento.dataVisita = dataVisita;
      if (valorVisita !== undefined) agendamento.valorVisita = valorVisita;
      if (observacoes !== undefined) agendamento.observacoes = observacoes;
      if (guiaId !== undefined) agendamento.guiaId = guiaId;
      if (caravanaId !== undefined) agendamento.caravanaId = caravanaId;
      await agendamento.save({ transaction });
      return Agendamento.findByPk(agendamento.id, { include, transaction });
    });
  }

  static async delete(req) {
    const { id } = req.params;
    const agendamento = await Agendamento.findByPk(id);
    if (!agendamento) throw new Error('Agendamento não encontrado.');
    await agendamento.destroy();
    return agendamento;
  }
}

export { AgendamentoService };
