import { Op, fn, col, literal, QueryTypes } from 'sequelize';
import sequelize from '../config/database-connection.js';
import { Agendamento } from '../models/Agendamento.js';
import { Caravana } from '../models/Caravana.js';
import { Guia } from '../models/Guia.js';
import { Projeto } from '../models/Projeto.js';
import { GrupoDePesquisa } from '../models/GrupoDePesquisa.js';
import { Coordenador } from '../models/Coordenador.js';
import { Pesquisador } from '../models/Pesquisador.js';
import { Observacao } from '../models/Observacao.js';
import { Constelacao } from '../models/Constelacao.js';

const toNumber = (v) => (v == null ? 0 : Number(v));

function rangeDate(field, dataInicial, dataFinal) {
  if (!dataInicial && !dataFinal) return {};
  const range = {};
  if (dataInicial) range[Op.gte] = dataInicial;
  if (dataFinal) range[Op.lte] = dataFinal;
  return { [field]: range };
}

function rangeDateTime(field, dataInicial, dataFinal) {
  if (!dataInicial && !dataFinal) return {};
  const range = {};
  if (dataInicial) range[Op.gte] = `${dataInicial} 00:00:00`;
  if (dataFinal) range[Op.lte] = `${dataFinal} 23:59:59`;
  return { [field]: range };
}

class ReportService {
  // ─── RF39 — Listar Agendamentos (Período, Tipo de Visita, Guia) ─────────────
  static async agendamentos(req) {
    const { dataInicial, dataFinal, tipoVisita, guiaId } = req.query;

    const where = {
      ...rangeDateTime('dataVisita', dataInicial, dataFinal),
      ...(tipoVisita ? { tipoVisita } : {}),
      ...(guiaId ? { guiaId: Number(guiaId) } : {}),
    };

    const linhas = await Agendamento.findAll({
      where,
      include: [
        { model: Caravana, as: 'caravana' },
        { model: Guia, as: 'guia' },
      ],
      order: [['dataVisita', 'ASC']],
    });

    // Agregações: COUNT(*) e SUM(quantidadeVisitantes)
    const [agg] = await Agendamento.findAll({
      where,
      include: [{ model: Caravana, as: 'caravana', attributes: [], required: true }],
      attributes: [
        [fn('COUNT', col('agendamento.id')), 'totalAgendamentos'],
        [fn('SUM', col('caravana.quantidade_visitantes')), 'totalVisitantes'],
        [fn('SUM', col('valor_visita')), 'totalValor'],
      ],
      raw: true,
    });

    return {
      filtros: { dataInicial, dataFinal, tipoVisita, guiaId },
      linhas: linhas.map((a) => {
        const d = a.dataVisita instanceof Date ? a.dataVisita : new Date(a.dataVisita);
        return {
          id: a.id,
          dataVisita: a.dataVisita,
          horario: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
          nomeCaravana: a.caravana?.nome ?? null,
          instituicao: a.caravana?.instituicao ?? null,
          quantidadeVisitantes: a.caravana?.quantidadeVisitantes ?? 0,
          guiaResponsavel: a.guia?.nome ?? null,
          tipoVisita: a.tipoVisita,
          valorVisita: a.valorVisita,
        };
      }),
      totais: {
        totalAgendamentos: toNumber(agg?.totalAgendamentos),
        totalVisitantes: toNumber(agg?.totalVisitantes),
        totalValor: toNumber(agg?.totalValor),
      },
    };
  }

  // ─── RF40 — Totais de Visitantes por Mês (Período) ──────────────────────────
  static async visitantesPorMes(req) {
    const { dataInicial, dataFinal } = req.query;

    const params = {};
    let dateFilter = '';
    if (dataInicial) {
      dateFilter += ' AND a.data_visita >= :dataInicial';
      params.dataInicial = `${dataInicial} 00:00:00`;
    }
    if (dataFinal) {
      dateFilter += ' AND a.data_visita <= :dataFinal';
      params.dataFinal = `${dataFinal} 23:59:59`;
    }

    // GROUP BY mês/ano usando strftime (SQLite)
    const linhas = await sequelize.query(
      `
        SELECT
          strftime('%Y-%m', a.data_visita) AS mesAno,
          COUNT(a.id) AS totalAgendamentos,
          SUM(c.quantidade_visitantes) AS totalVisitantes,
          AVG(c.quantidade_visitantes) AS mediaVisitantes
        FROM agendamentos a
        JOIN caravanas c ON c.id = a.caravana_id
        WHERE 1=1 ${dateFilter}
        GROUP BY strftime('%Y-%m', a.data_visita)
        ORDER BY mesAno ASC
      `,
      { replacements: params, type: QueryTypes.SELECT }
    );

    const [totais] = await sequelize.query(
      `
        SELECT
          COUNT(a.id) AS totalAgendamentos,
          SUM(c.quantidade_visitantes) AS totalVisitantes,
          AVG(c.quantidade_visitantes) AS mediaGeral
        FROM agendamentos a
        JOIN caravanas c ON c.id = a.caravana_id
        WHERE 1=1 ${dateFilter}
      `,
      { replacements: params, type: QueryTypes.SELECT }
    );

    return {
      filtros: { dataInicial, dataFinal },
      linhas: linhas.map((l) => ({
        mesAno: l.mesAno,
        totalAgendamentos: toNumber(l.totalAgendamentos),
        totalVisitantes: toNumber(l.totalVisitantes),
        mediaVisitantes: Number(toNumber(l.mediaVisitantes).toFixed(2)),
      })),
      totais: {
        totalAgendamentos: toNumber(totais?.totalAgendamentos),
        totalVisitantes: toNumber(totais?.totalVisitantes),
        mediaGeral: Number(toNumber(totais?.mediaGeral).toFixed(2)),
      },
    };
  }

  // ─── RF41 — Listar Projeto (Grupo, Status, Data) ────────────────────────────
  static async projetos(req) {
    const { grupoDePesquisaId, status, dataInicial, dataFinal } = req.query;

    const where = {
      ...rangeDate('dataInicio', dataInicial, dataFinal),
      ...(grupoDePesquisaId ? { grupoDePesquisaId: Number(grupoDePesquisaId) } : {}),
      ...(status ? { status } : {}),
    };

    const projetos = await Projeto.findAll({
      where,
      include: [
        {
          model: GrupoDePesquisa,
          as: 'grupoDePesquisa',
          include: [{ model: Pesquisador, as: 'pesquisadores', attributes: ['id'], through: { attributes: [] } }],
        },
        { model: Coordenador, as: 'coordenador' },
      ],
      order: [[{ model: GrupoDePesquisa, as: 'grupoDePesquisa' }, 'nome', 'ASC']],
    });

    const linhas = projetos.map((p) => ({
      dataInicio: p.dataInicio,
      projeto: p.titulo,
      responsavel: p.coordenador?.nome ?? null,
      nomeGrupo: p.grupoDePesquisa?.nome ?? null,
      area: p.areaDePesquisa,
      qtdPesquisadores: p.grupoDePesquisa?.pesquisadores?.length ?? 0,
      status: p.status,
    }));

    // Agregações: total de projetos (COUNT), total de pesquisadores (SUM)
    const totalProjetos = await Projeto.count({ where });
    const totalPesquisadores = linhas.reduce((s, l) => s + l.qtdPesquisadores, 0);

    return {
      filtros: { grupoDePesquisaId, status, dataInicial, dataFinal },
      linhas,
      totais: { totalProjetos, totalPesquisadores },
    };
  }

  // ─── RF42 — Pesquisadores por Projeto ───────────────────────────────────────
  static async pesquisadoresPorProjeto(req) {
    const { projetoId, dataInicial, dataFinal } = req.query;

    const whereProjeto = projetoId ? { id: Number(projetoId) } : {};

    const projetos = await Projeto.findAll({
      where: whereProjeto,
      include: [
        {
          model: GrupoDePesquisa,
          as: 'grupoDePesquisa',
          required: true,
          include: [
            {
              model: Pesquisador,
              as: 'pesquisadores',
              required: true,
              through: { attributes: [] },
              where: {
                ...rangeDate('createdAt', dataInicial, dataFinal),
              },
            },
          ],
        },
      ],
      order: [
        [{ model: GrupoDePesquisa, as: 'grupoDePesquisa' }, 'nome', 'ASC'],
        [
          { model: GrupoDePesquisa, as: 'grupoDePesquisa' },
          { model: Pesquisador, as: 'pesquisadores' },
          'nome',
          'ASC',
        ],
      ],
    });

    // Linhas: cada pesquisador × projeto
    const linhas = [];
    const contagemPorGrupo = new Map();

    for (const p of projetos) {
      const grupo = p.grupoDePesquisa;
      if (!grupo) continue;
      for (const pesq of grupo.pesquisadores) {
        linhas.push({
          nomeGrupo: grupo.nome,
          projetoVinculado: p.titulo,
          nomePesquisador: pesq.nome,
          curso: pesq.especialidade,
          dataIngresso: pesq.createdAt,
          status: pesq.status,
        });
        const chave = grupo.nome;
        contagemPorGrupo.set(chave, (contagemPorGrupo.get(chave) ?? 0) + 1);
      }
    }

    // COUNT por grupo
    const totaisPorGrupo = Array.from(contagemPorGrupo.entries())
      .map(([grupo, total]) => ({ grupo, totalPesquisadores: total }))
      .sort((a, b) => a.grupo.localeCompare(b.grupo));

    return {
      filtros: { projetoId, dataInicial, dataFinal },
      linhas,
      totaisPorGrupo,
      totais: {
        totalPesquisadores: linhas.length,
        totalGrupos: contagemPorGrupo.size,
      },
    };
  }

  // ─── RF43 — Listar Observações (Período, Projeto, Constelação) ──────────────
  static async observacoes(req) {
    const { dataInicial, dataFinal, projetoId, constelacaoId } = req.query;

    const where = {
      ...rangeDate('dataObservacao', dataInicial, dataFinal),
      ...(projetoId ? { projetoId: Number(projetoId) } : {}),
      ...(constelacaoId ? { constelacaoId: Number(constelacaoId) } : {}),
    };

    const linhas = await Observacao.findAll({
      where,
      include: [
        { model: Projeto, as: 'projeto', include: [{ model: Coordenador, as: 'coordenador' }] },
        { model: Constelacao, as: 'constelacao' },
      ],
      order: [['dataObservacao', 'ASC']],
    });

    // Agregações: COUNT total, COUNT descobertas (versao=1), COUNT atualizações (versao>1)
    const [agg] = await Observacao.findAll({
      where,
      attributes: [
        [fn('COUNT', col('id')), 'totalObservacoes'],
        [fn('SUM', literal("CASE WHEN versao_observacao = 1 THEN 1 ELSE 0 END")), 'totalDescobertas'],
        [fn('SUM', literal("CASE WHEN versao_observacao > 1 THEN 1 ELSE 0 END")), 'totalAtualizacoes'],
      ],
      raw: true,
    });

    return {
      filtros: { dataInicial, dataFinal, projetoId, constelacaoId },
      linhas: linhas.map((o) => ({
        dataObservacao: o.dataObservacao,
        projetoVinculado: o.projeto?.titulo ?? null,
        coordenadorResponsavel: o.projeto?.coordenador?.nome ?? null,
        constelacao: o.constelacao?.nome ?? null,
        instrumento: o.instrumentoUtilizado,
        versao: o.versaoObservacao,
        tipoRegistro: o.versaoObservacao === 1 ? 'Descoberta' : 'Atualização',
      })),
      totais: {
        totalObservacoes: toNumber(agg?.totalObservacoes),
        totalDescobertas: toNumber(agg?.totalDescobertas),
        totalAtualizacoes: toNumber(agg?.totalAtualizacoes),
      },
    };
  }

  // ─── RF44 — Estatísticas de Observações por Projeto e Constelação ───────────
  static async estatisticasObservacoes(req) {
    const { dataInicial, dataFinal, projetoId, constelacaoId } = req.query;

    const params = {};
    const conds = ['1=1'];
    if (dataInicial) {
      conds.push('o.data_observacao >= :dataInicial');
      params.dataInicial = dataInicial;
    }
    if (dataFinal) {
      conds.push('o.data_observacao <= :dataFinal');
      params.dataFinal = dataFinal;
    }
    if (projetoId) {
      conds.push('o.projeto_id = :projetoId');
      params.projetoId = Number(projetoId);
    }
    if (constelacaoId) {
      conds.push('o.constelacao_id = :constelacaoId');
      params.constelacaoId = Number(constelacaoId);
    }

    // GROUP BY projeto, constelação + COUNT/MIN/MAX
    const linhas = await sequelize.query(
      `
        SELECT
          MIN(o.data_observacao) AS dataPrimeiraObs,
          MAX(o.data_observacao) AS dataUltimaObs,
          p.titulo AS projeto,
          c.nome AS constelacao,
          SUM(CASE WHEN o.versao_observacao = 1 THEN 1 ELSE 0 END) AS totalDescobertas,
          SUM(CASE WHEN o.versao_observacao > 1 THEN 1 ELSE 0 END) AS totalAtualizacoes,
          COUNT(o.id) AS totalObservacoes
        FROM observacoes o
        JOIN projetos p ON p.id = o.projeto_id
        JOIN constelacoes c ON c.id = o.constelacao_id
        WHERE ${conds.join(' AND ')}
        GROUP BY o.projeto_id, o.constelacao_id
        ORDER BY totalObservacoes DESC, projeto ASC, constelacao ASC
      `,
      { replacements: params, type: QueryTypes.SELECT }
    );

    const linhasNum = linhas.map((l) => ({
      dataPrimeiraObs: l.dataPrimeiraObs,
      dataUltimaObs: l.dataUltimaObs,
      projeto: l.projeto,
      constelacao: l.constelacao,
      totalDescobertas: toNumber(l.totalDescobertas),
      totalAtualizacoes: toNumber(l.totalAtualizacoes),
      totalObservacoes: toNumber(l.totalObservacoes),
    }));

    return {
      filtros: { dataInicial, dataFinal, projetoId, constelacaoId },
      linhas: linhasNum,
      totais: {
        totalProjetos: new Set(linhasNum.map((l) => l.projeto)).size,
        totalConstelacoes: new Set(linhasNum.map((l) => l.constelacao)).size,
        totalObservacoes: linhasNum.reduce((s, l) => s + l.totalObservacoes, 0),
      },
    };
  }
}

export { ReportService };
