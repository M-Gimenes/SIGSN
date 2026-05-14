import { ValidationError } from './errors.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const PAGINATION_DEFAULTS = { page: 1, pageSize: 50, maxPageSize: 500 };

function parseDate(value, field, erros) {
  if (value == null || value === '') return undefined;
  if (typeof value !== 'string' || !DATE_RE.test(value)) {
    erros.push(`${field}: formato esperado YYYY-MM-DD.`);
    return undefined;
  }
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) {
    erros.push(`${field}: data inválida.`);
    return undefined;
  }
  return value;
}

function parseId(value, field, erros) {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    erros.push(`${field}: deve ser inteiro positivo.`);
    return undefined;
  }
  return n;
}

function parseEnum(value, field, allowed, erros) {
  if (value == null || value === '') return undefined;
  if (!allowed.includes(value)) {
    erros.push(`${field}: deve ser um de ${allowed.join(', ')}.`);
    return undefined;
  }
  return value;
}

function parsePagination(query, erros) {
  const page = query.page == null || query.page === ''
    ? PAGINATION_DEFAULTS.page
    : Number(query.page);
  const pageSize = query.pageSize == null || query.pageSize === ''
    ? PAGINATION_DEFAULTS.pageSize
    : Number(query.pageSize);

  if (!Number.isInteger(page) || page < 1) {
    erros.push('page: deve ser inteiro >= 1.');
  }
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    erros.push('pageSize: deve ser inteiro >= 1.');
  } else if (pageSize > PAGINATION_DEFAULTS.maxPageSize) {
    erros.push(`pageSize: máximo permitido é ${PAGINATION_DEFAULTS.maxPageSize}.`);
  }
  return { page, pageSize };
}

function validarOrdemDeDatas(dataInicial, dataFinal, erros) {
  if (dataInicial && dataFinal && dataInicial > dataFinal) {
    erros.push('dataInicial não pode ser posterior a dataFinal.');
  }
}

function finalize(erros) {
  if (erros.length) throw new ValidationError(erros);
}

// ─── Por relatório ───────────────────────────────────────────────────────────

const TIPOS_CARAVANA = ['Escolar', 'Universitária', 'Turística', 'Institucional'];

export function parseFiltrosAgendamentos(query) {
  const erros = [];
  const out = {
    dataInicial: parseDate(query.dataInicial, 'dataInicial', erros),
    dataFinal:   parseDate(query.dataFinal,   'dataFinal',   erros),
    tipoVisita:  parseEnum(query.tipoVisita, 'tipoVisita', TIPOS_CARAVANA, erros),
    guiaId:      parseId(query.guiaId, 'guiaId', erros),
    ...parsePagination(query, erros),
  };
  validarOrdemDeDatas(out.dataInicial, out.dataFinal, erros);
  finalize(erros);
  return out;
}

export function parseFiltrosVisitantesPorMes(query) {
  const erros = [];
  const out = {
    dataInicial: parseDate(query.dataInicial, 'dataInicial', erros),
    dataFinal:   parseDate(query.dataFinal,   'dataFinal',   erros),
  };
  validarOrdemDeDatas(out.dataInicial, out.dataFinal, erros);
  finalize(erros);
  return out;
}

export function parseFiltrosProjetos(query) {
  const erros = [];
  const out = {
    dataInicial:       parseDate(query.dataInicial, 'dataInicial', erros),
    dataFinal:         parseDate(query.dataFinal,   'dataFinal',   erros),
    grupoDePesquisaId: parseId(query.grupoDePesquisaId, 'grupoDePesquisaId', erros),
    status:            parseEnum(query.status, 'status', ['ativo', 'concluido', 'suspenso'], erros),
  };
  validarOrdemDeDatas(out.dataInicial, out.dataFinal, erros);
  finalize(erros);
  return out;
}

export function parseFiltrosPesquisadoresPorProjeto(query) {
  const erros = [];
  const out = {
    projetoId:   parseId(query.projetoId, 'projetoId', erros),
    dataInicial: parseDate(query.dataInicial, 'dataInicial', erros),
    dataFinal:   parseDate(query.dataFinal,   'dataFinal',   erros),
    ...parsePagination(query, erros),
  };
  validarOrdemDeDatas(out.dataInicial, out.dataFinal, erros);
  finalize(erros);
  return out;
}

export function parseFiltrosObservacoes(query) {
  const erros = [];
  const out = {
    dataInicial:   parseDate(query.dataInicial, 'dataInicial', erros),
    dataFinal:     parseDate(query.dataFinal,   'dataFinal',   erros),
    projetoId:     parseId(query.projetoId,     'projetoId',     erros),
    constelacaoId: parseId(query.constelacaoId, 'constelacaoId', erros),
    ...parsePagination(query, erros),
  };
  validarOrdemDeDatas(out.dataInicial, out.dataFinal, erros);
  finalize(erros);
  return out;
}

export function parseFiltrosEstatisticasObservacoes(query) {
  const erros = [];
  const out = {
    dataInicial:   parseDate(query.dataInicial, 'dataInicial', erros),
    dataFinal:     parseDate(query.dataFinal,   'dataFinal',   erros),
    projetoId:     parseId(query.projetoId,     'projetoId',     erros),
    constelacaoId: parseId(query.constelacaoId, 'constelacaoId', erros),
  };
  validarOrdemDeDatas(out.dataInicial, out.dataFinal, erros);
  finalize(erros);
  return out;
}
