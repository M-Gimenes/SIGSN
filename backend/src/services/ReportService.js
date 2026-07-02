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
import {
  parseFiltrosAgendamentos,
  parseFiltrosVisitantesPorMes,
  parseFiltrosProjetos,
  parseFiltrosPesquisadoresPorProjeto,
  parseFiltrosObservacoes,
  parseFiltrosEstatisticasObservacoes,
} from '../utils/reportFilters.js';
import { reportCache } from '../utils/reportCache.js';
import { withReportLogging } from '../utils/reportLogger.js';

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

function paginar(totalLinhas, page, pageSize) {
  return {
    page,
    pageSize,
    totalLinhas,
    totalPaginas: Math.max(1, Math.ceil(totalLinhas / pageSize)),
  };
}

class ReportService {
  // ─── RF39 — Listar Agendamentos (Período, Tipo de Visita, Guia) ─────────────
  static async agendamentos(req) {
    const filtros = parseFiltrosAgendamentos(req.query);
    return withReportLogging('RF39:agendamentos', filtros, async () => {
      const { dataInicial, dataFinal, tipoVisita, guiaId, page, pageSize } = filtros;

      const where = {
        ...rangeDateTime('dataVisita', dataInicial, dataFinal),
        ...(guiaId ? { guiaId } : {}),
      };
      const caravanaWhere = tipoVisita ? { tipoCaravana: tipoVisita } : undefined;

      // Página de linhas + agregações sobre o universo total, em paralelo
      const [linhas, agg, totalLinhasUniverso] = await Promise.all([
        Agendamento.findAll({
          where,
          include: [
            { model: Caravana, as: 'caravana', required: !!caravanaWhere, where: caravanaWhere },
            { model: Guia, as: 'guia' },
          ],
          order: [['dataVisita', 'ASC']],
          limit: pageSize,
          offset: (page - 1) * pageSize,
        }),
        Agendamento.findAll({
          where,
          include: [{ model: Caravana, as: 'caravana', attributes: [], required: true, where: caravanaWhere }],
          attributes: [
            [fn('COUNT', col('agendamento.id')), 'totalAgendamentos'],
            [fn('SUM', col('caravana.quantidade_visitantes')), 'totalVisitantes'],
            [fn('SUM', col('valor_visita')), 'totalValor'],
          ],
          raw: true,
        }).then((r) => r[0]),
        Agendamento.count({
          where,
          include: caravanaWhere ? [{ model: Caravana, as: 'caravana', attributes: [], required: true, where: caravanaWhere }] : [],
          distinct: true,
          col: 'id',
        }),
      ]);

      return {
        filtros: { dataInicial, dataFinal, tipoVisita, guiaId },
        paginacao: paginar(totalLinhasUniverso, page, pageSize),
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
            tipoVisita: a.caravana?.tipoCaravana ?? null,
            valorVisita: a.valorVisita,
          };
        }),
        totais: {
          totalAgendamentos: toNumber(agg?.totalAgendamentos),
          totalVisitantes: toNumber(agg?.totalVisitantes),
          totalValor: toNumber(agg?.totalValor),
        },
      };
    });
  }

  // ─── RF40 — Totais de Visitantes por Mês (Período) ──────────────────────────
  static async visitantesPorMes(req) {
    const filtros = parseFiltrosVisitantesPorMes(req.query);
    return withReportLogging('RF40:visitantesPorMes', filtros, async () => {
      const { dataInicial, dataFinal } = filtros;

      const cacheKey = reportCache.constructor.key('RF40', filtros);
      const cached = reportCache.get(cacheKey);
      if (cached) return { ...cached, meta: { cache: 'HIT' } };

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

      // strftime só existe no SQLite; no Postgres usa-se to_char. Aliases em
      // camelCase precisam de aspas duplas, senão o Postgres os rebaixa para
      // minúsculas e o mapeamento no JS retorna undefined.
      const mesAnoExpr = sequelize.getDialect() === 'postgres'
        ? `to_char(a.data_visita, 'YYYY-MM')`
        : `strftime('%Y-%m', a.data_visita)`;

      const linhas = await sequelize.query(
        `
          SELECT
            ${mesAnoExpr} AS "mesAno",
            COUNT(a.id) AS "totalAgendamentos",
            SUM(c.quantidade_visitantes) AS "totalVisitantes",
            AVG(c.quantidade_visitantes) AS "mediaVisitantes"
          FROM agendamentos a
          JOIN caravanas c ON c.id = a.caravana_id
          WHERE 1=1 ${dateFilter}
          GROUP BY ${mesAnoExpr}
          ORDER BY ${mesAnoExpr} ASC
        `,
        { replacements: params, type: QueryTypes.SELECT }
      );

      const [totais] = await sequelize.query(
        `
          SELECT
            COUNT(a.id) AS "totalAgendamentos",
            SUM(c.quantidade_visitantes) AS "totalVisitantes",
            AVG(c.quantidade_visitantes) AS "mediaGeral"
          FROM agendamentos a
          JOIN caravanas c ON c.id = a.caravana_id
          WHERE 1=1 ${dateFilter}
        `,
        { replacements: params, type: QueryTypes.SELECT }
      );

      const resultado = {
        filtros,
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

      reportCache.set(cacheKey, resultado);
      return { ...resultado, meta: { cache: 'MISS' } };
    });
  }

  // ─── RF41 — Listar Projeto (Grupo, Status, Data) ────────────────────────────
  static async projetos(req) {
    const filtros = parseFiltrosProjetos(req.query);
    return withReportLogging('RF41:projetos', filtros, async () => {
      const { grupoDePesquisaId, status, dataInicial, dataFinal } = filtros;

      const where = {
        ...rangeDate('dataInicio', dataInicial, dataFinal),
        ...(grupoDePesquisaId ? { grupoDePesquisaId } : {}),
        ...(status ? { status } : {}),
      };

      const projetos = await Projeto.findAll({
        where,
        include: [
          {
            model: GrupoDePesquisa,
            as: 'grupoDePesquisa',
            include: [
              { model: Pesquisador, as: 'pesquisadores', attributes: ['id'], through: { attributes: [] } },
            ],
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

      return {
        filtros,
        linhas,
        totais: {
          totalProjetos: linhas.length,
          totalPesquisadores: linhas.reduce((s, l) => s + l.qtdPesquisadores, 0),
        },
      };
    });
  }

  // ─── RF42 — Pesquisadores por Projeto ───────────────────────────────────────
  static async pesquisadoresPorProjeto(req) {
    const filtros = parseFiltrosPesquisadoresPorProjeto(req.query);
    return withReportLogging('RF42:pesquisadoresPorProjeto', filtros, async () => {
      const { projetoId, dataInicial, dataFinal, page, pageSize } = filtros;

      const whereProjeto = projetoId ? { id: projetoId } : {};

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
                where: { ...rangeDate('createdAt', dataInicial, dataFinal) },
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

      const todasLinhas = [];
      const contagemPorGrupo = new Map();
      for (const p of projetos) {
        const grupo = p.grupoDePesquisa;
        if (!grupo) continue;
        for (const pesq of grupo.pesquisadores) {
          todasLinhas.push({
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

      const inicio = (page - 1) * pageSize;
      const linhas = todasLinhas.slice(inicio, inicio + pageSize);

      const totaisPorGrupo = Array.from(contagemPorGrupo.entries())
        .map(([grupo, total]) => ({ grupo, totalPesquisadores: total }))
        .sort((a, b) => a.grupo.localeCompare(b.grupo));

      return {
        filtros: { projetoId, dataInicial, dataFinal },
        paginacao: paginar(todasLinhas.length, page, pageSize),
        linhas,
        totaisPorGrupo,
        totais: {
          totalPesquisadores: todasLinhas.length,
          totalGrupos: contagemPorGrupo.size,
        },
      };
    });
  }

  // ─── RF43 — Listar Observações (Período, Projeto, Constelação) ──────────────
  static async observacoes(req) {
    const filtros = parseFiltrosObservacoes(req.query);
    return withReportLogging('RF43:observacoes', filtros, async () => {
      const { dataInicial, dataFinal, projetoId, constelacaoId, page, pageSize } = filtros;

      const where = {
        ...rangeDate('dataObservacao', dataInicial, dataFinal),
        ...(projetoId ? { projetoId } : {}),
        ...(constelacaoId ? { constelacaoId } : {}),
      };

      const [linhas, agg, totalLinhasUniverso] = await Promise.all([
        Observacao.findAll({
          where,
          include: [
            { model: Projeto, as: 'projeto', include: [{ model: Coordenador, as: 'coordenador' }] },
            { model: Constelacao, as: 'constelacao' },
          ],
          order: [['dataObservacao', 'ASC']],
          limit: pageSize,
          offset: (page - 1) * pageSize,
        }),
        Observacao.findAll({
          where,
          attributes: [
            [fn('COUNT', col('id')), 'totalObservacoes'],
            [fn('SUM', literal('CASE WHEN versao_observacao = 1 THEN 1 ELSE 0 END')), 'totalDescobertas'],
            [fn('SUM', literal('CASE WHEN versao_observacao > 1 THEN 1 ELSE 0 END')), 'totalAtualizacoes'],
          ],
          raw: true,
        }).then((r) => r[0]),
        Observacao.count({ where }),
      ]);

      return {
        filtros: { dataInicial, dataFinal, projetoId, constelacaoId },
        paginacao: paginar(totalLinhasUniverso, page, pageSize),
        
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
    });
  }

  // ─── RF44 — Estatísticas de Observações por Projeto e Constelação ───────────
  static async estatisticasObservacoes(req) {
    const filtros = parseFiltrosEstatisticasObservacoes(req.query);
    return withReportLogging('RF44:estatisticasObservacoes', filtros, async () => {
      const { dataInicial, dataFinal, projetoId, constelacaoId } = filtros;

      const cacheKey = reportCache.constructor.key('RF44', filtros);
      const cached = reportCache.get(cacheKey);
      if (cached) return { ...cached, meta: { cache: 'HIT' } };

      const params = {};
      const conds = ['1=1'];
      if (dataInicial) { conds.push('o.data_observacao >= :dataInicial'); params.dataInicial = dataInicial; }
      if (dataFinal)   { conds.push('o.data_observacao <= :dataFinal');   params.dataFinal   = dataFinal; }
      if (projetoId)   { conds.push('o.projeto_id = :projetoId');         params.projetoId   = projetoId; }
      if (constelacaoId) { conds.push('o.constelacao_id = :constelacaoId'); params.constelacaoId = constelacaoId; }

      const linhas = await sequelize.query(
        `
          SELECT
            MIN(o.data_observacao) AS "dataPrimeiraObs",
            MAX(o.data_observacao) AS "dataUltimaObs",
            p.titulo AS "projeto",
            c.nome AS "constelacao",
            SUM(CASE WHEN o.versao_observacao = 1 THEN 1 ELSE 0 END) AS "totalDescobertas",
            SUM(CASE WHEN o.versao_observacao > 1 THEN 1 ELSE 0 END) AS "totalAtualizacoes",
            COUNT(o.id) AS "totalObservacoes"
          FROM observacoes o
          JOIN projetos p ON p.id = o.projeto_id
          JOIN constelacoes c ON c.id = o.constelacao_id
          WHERE ${conds.join(' AND ')}
          GROUP BY o.projeto_id, o.constelacao_id, p.titulo, c.nome
          ORDER BY "totalObservacoes" DESC, "projeto" ASC, "constelacao" ASC
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

      const resultado = {
        filtros,
        linhas: linhasNum,
        totais: {
          totalProjetos: new Set(linhasNum.map((l) => l.projeto)).size,
          totalConstelacoes: new Set(linhasNum.map((l) => l.constelacao)).size,
          totalObservacoes: linhasNum.reduce((s, l) => s + l.totalObservacoes, 0),
        },
      };

      reportCache.set(cacheKey, resultado);
      return { ...resultado, meta: { cache: 'MISS' } };
    });
  }
}

export { ReportService };
