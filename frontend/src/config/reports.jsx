import Pill from '../components/ui/Pill.jsx';
import { formatCurrency, formatDateOnly, formatNumber } from '../utils/format.js';

const tipoVisitaPill = (v) => (v ? <span className="pill">{v}</span> : '—');
const statusBoolPill = (v) => (v ? <Pill value="Ativo" /> : <Pill value="Inativo" />);

export const REPORTS = {
  'rel-agendamentos': {
    label: 'Agendamentos',
    subtitle: 'Por Período, Tipo de Visita e Guia · RF39',
    intro:
      'Lista os agendamentos no intervalo selecionado, com totalizações de visitantes e arrecadação.',
    endpoint: '/relatorios/agendamentos',
    filters: [
      { name: 'dataInicial', label: 'Data Inicial', type: 'date' },
      { name: 'dataFinal', label: 'Data Final', type: 'date' },
      {
        name: 'tipoVisita',
        label: 'Tipo de Visita',
        type: 'select',
        options: ['Escolar', 'Universitária', 'Turística', 'Institucional'],
      },
      {
        name: 'guiaId',
        label: 'Guia Responsável',
        type: 'fk',
        endpoint: '/guias',
        labelFn: (g) => `${g.nome} (${g.disponibilidade})`,
      },
    ],
    columns: [
      { key: 'dataVisita', label: 'Data', fmt: formatDateOnly },
      { key: 'horario', label: 'Horário' },
      { key: 'nomeCaravana', label: 'Caravana' },
      { key: 'instituicao', label: 'Instituição' },
      { key: 'quantidadeVisitantes', label: 'Qtd.' },
      { key: 'guiaResponsavel', label: 'Guia' },
      { key: 'tipoVisita', label: 'Tipo', render: tipoVisitaPill },
      { key: 'valorVisita', label: 'Valor', fmt: formatCurrency },
    ],
    stats: [
      { key: 'totalAgendamentos', label: 'Total de Agendamentos', sub: 'COUNT' },
      { key: 'totalVisitantes', label: 'Total de Visitantes', sub: 'SUM' },
      {
        key: 'totalValor',
        label: 'Total Arrecadado',
        sub: 'SUM (R$)',
        fmt: (v) => `R$ ${Number(v || 0).toFixed(2)}`,
      },
    ],
  },

  'rel-visitantes': {
    label: 'Visitantes por Mês',
    subtitle: 'Por Período · RF40',
    intro:
      'Agrupa agendamentos e visitantes por Mês/Ano, com média de visitantes por agendamento.',
    endpoint: '/relatorios/visitantes-por-mes',
    filters: [
      { name: 'dataInicial', label: 'Data Inicial', type: 'date' },
      { name: 'dataFinal', label: 'Data Final', type: 'date' },
    ],
    columns: [
      { key: 'mesAno', label: 'Mês/Ano' },
      { key: 'totalAgendamentos', label: 'Total Agendamentos' },
      { key: 'totalVisitantes', label: 'Total Visitantes' },
      {
        key: 'mediaVisitantes',
        label: 'Média / Agendamento',
        fmt: (v) => formatNumber(v),
      },
    ],
    stats: [
      { key: 'totalAgendamentos', label: 'Total de Agendamentos', sub: 'COUNT' },
      { key: 'totalVisitantes', label: 'Total de Visitantes', sub: 'SUM' },
      { key: 'mediaGeral', label: 'Média Geral', sub: 'AVG', fmt: (v) => formatNumber(v) },
    ],
  },

  'rel-projetos': {
    label: 'Projetos',
    subtitle: 'Por Grupo de Pesquisa, Status e Data · RF41',
    intro:
      'Projetos filtrados por grupo, status e período de início, agrupados em ordem alfabética por grupo.',
    endpoint: '/relatorios/projetos',
    filters: [
      { name: 'dataInicial', label: 'Início ≥', type: 'date' },
      { name: 'dataFinal', label: 'Início ≤', type: 'date' },
      {
        name: 'grupoDePesquisaId',
        label: 'Grupo de Pesquisa',
        type: 'fk',
        endpoint: '/grupos-de-pesquisa',
        labelFn: (g) => g.nome,
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: ['ativo', 'concluido', 'suspenso'],
      },
    ],
    columns: [
      { key: 'dataInicio', label: 'Data Início', fmt: formatDateOnly },
      { key: 'projeto', label: 'Projeto' },
      { key: 'responsavel', label: 'Responsável' },
      { key: 'nomeGrupo', label: 'Grupo' },
      { key: 'area', label: 'Área' },
      { key: 'qtdPesquisadores', label: 'Qtd. Pesq.' },
      { key: 'status', label: 'Status', render: (v) => <Pill value={v} /> },
    ],
    stats: [
      { key: 'totalProjetos', label: 'Total de Projetos', sub: 'COUNT' },
      { key: 'totalPesquisadores', label: 'Total de Pesquisadores', sub: 'SUM' },
    ],
  },

  'rel-pesquisadores': {
    label: 'Pesquisadores por Projeto',
    subtitle: 'Agrupado por Grupo · RF42',
    intro:
      'Lista todos os pesquisadores envolvidos em projetos, agrupados por Grupo de Pesquisa.',
    endpoint: '/relatorios/pesquisadores-por-projeto',
    filters: [
      {
        name: 'projetoId',
        label: 'Projeto',
        type: 'fk',
        endpoint: '/projetos',
        labelFn: (p) => p.titulo,
      },
      { name: 'dataInicial', label: 'Ingresso ≥', type: 'date' },
      { name: 'dataFinal', label: 'Ingresso ≤', type: 'date' },
    ],
    columns: [
      { key: 'nomeGrupo', label: 'Grupo' },
      { key: 'projetoVinculado', label: 'Projeto Vinculado' },
      { key: 'nomePesquisador', label: 'Pesquisador' },
      { key: 'curso', label: 'Curso / Especialidade' },
      { key: 'dataIngresso', label: 'Data Ingresso', fmt: formatDateOnly },
      { key: 'status', label: 'Status', render: statusBoolPill },
    ],
    stats: [
      { key: 'totalPesquisadores', label: 'Total de Pesquisadores', sub: 'COUNT' },
      { key: 'totalGrupos', label: 'Total de Grupos', sub: 'COUNT DISTINCT' },
    ],
    subgroup: {
      title: 'Pesquisadores por Grupo',
      from: 'totaisPorGrupo',
      columns: [
        { key: 'grupo', label: 'Grupo' },
        { key: 'totalPesquisadores', label: 'Total' },
      ],
    },
  },

  'rel-observacoes': {
    label: 'Observações',
    subtitle: 'Por Período, Projeto e Constelação · RF43',
    intro:
      'Lista observações em ordem cronológica, com totalização por Tipo de Registro (Descoberta vs Atualização).',
    endpoint: '/relatorios/observacoes',
    filters: [
      { name: 'dataInicial', label: 'Data Inicial', type: 'date' },
      { name: 'dataFinal', label: 'Data Final', type: 'date' },
      {
        name: 'projetoId',
        label: 'Projeto',
        type: 'fk',
        endpoint: '/projetos',
        labelFn: (p) => p.titulo,
      },
      {
        name: 'constelacaoId',
        label: 'Constelação',
        type: 'fk',
        endpoint: '/constelacoes',
        labelFn: (c) => c.nome,
      },
    ],
    columns: [
      { key: 'dataObservacao', label: 'Data', fmt: formatDateOnly },
      { key: 'projetoVinculado', label: 'Projeto' },
      { key: 'coordenadorResponsavel', label: 'Coordenador' },
      { key: 'constelacao', label: 'Constelação' },
      { key: 'instrumento', label: 'Instrumento' },
      { key: 'versao', label: 'Versão' },
      {
        key: 'tipoRegistro',
        label: 'Tipo',
        render: (v) => (
          <span className={`pill ${v === 'Descoberta' ? 'pill-ativo' : 'pill-suspenso'}`}>{v}</span>
        ),
      },
    ],
    stats: [
      { key: 'totalObservacoes', label: 'Total de Observações', sub: 'COUNT' },
      { key: 'totalDescobertas', label: 'Descobertas', sub: 'SUM(versão=1)' },
      { key: 'totalAtualizacoes', label: 'Atualizações', sub: 'SUM(versão>1)' },
    ],
  },

  'rel-estatisticas': {
    label: 'Estatísticas de Observações',
    subtitle: 'Por Projeto e Constelação · RF44',
    intro:
      'Estatísticas agrupadas por Projeto + Constelação, ordenadas pelo total de observações.',
    endpoint: '/relatorios/estatisticas-observacoes',
    filters: [
      { name: 'dataInicial', label: 'Data Inicial', type: 'date' },
      { name: 'dataFinal', label: 'Data Final', type: 'date' },
      {
        name: 'projetoId',
        label: 'Projeto',
        type: 'fk',
        endpoint: '/projetos',
        labelFn: (p) => p.titulo,
      },
      {
        name: 'constelacaoId',
        label: 'Constelação',
        type: 'fk',
        endpoint: '/constelacoes',
        labelFn: (c) => c.nome,
      },
    ],
    columns: [
      { key: 'dataPrimeiraObs', label: '1ª Observação', fmt: formatDateOnly },
      { key: 'dataUltimaObs', label: 'Última Observação', fmt: formatDateOnly },
      { key: 'projeto', label: 'Projeto' },
      { key: 'constelacao', label: 'Constelação' },
      { key: 'totalDescobertas', label: 'Descobertas' },
      { key: 'totalAtualizacoes', label: 'Atualizações' },
      { key: 'totalObservacoes', label: 'Total' },
    ],
    stats: [
      { key: 'totalProjetos', label: 'Projetos no relatório', sub: 'COUNT DISTINCT' },
      { key: 'totalConstelacoes', label: 'Constelações', sub: 'COUNT DISTINCT' },
      { key: 'totalObservacoes', label: 'Total de Observações', sub: 'SUM' },
    ],
  },
};

export const REPORT_KEYS = Object.keys(REPORTS);
