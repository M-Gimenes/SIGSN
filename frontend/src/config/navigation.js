export const SIDEBAR_SECTIONS = [
  {
    title: 'Sistema',
    items: [{ key: 'home', path: '/', label: 'Início', icon: 'ic-home' }],
  },
  {
    title: 'Visitas',
    items: [
      { key: 'agendamentos', path: '/agendamentos', label: 'Agendamentos', icon: 'ic-schedule' },
      { key: 'caravanas', path: '/caravanas', label: 'Caravanas', icon: 'ic-caravan' },
      { key: 'guias', path: '/guias', label: 'Guias', icon: 'ic-book' },
    ],
  },
  {
    title: 'Pesquisa',
    items: [
      { key: 'projetos', path: '/projetos', label: 'Projetos', icon: 'ic-project' },
      { key: 'observacoes', path: '/observacoes', label: 'Observações', icon: 'ic-telescope' },
      {
        key: 'grupos-de-pesquisa',
        path: '/grupos-de-pesquisa',
        label: 'Grupos de Pesquisa',
        icon: 'ic-group',
      },
      { key: 'pesquisadores', path: '/pesquisadores', label: 'Pesquisadores', icon: 'ic-researcher' },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      { key: 'coordenadores', path: '/coordenadores', label: 'Coordenadores', icon: 'ic-compass' },
      { key: 'constelacoes', path: '/constelacoes', label: 'Constelações', icon: 'ic-constellation' },
    ],
  },
  {
    title: 'Relatórios',
    items: [
      {
        key: 'rel-agendamentos',
        path: '/relatorios/rel-agendamentos',
        label: 'Agendamentos',
        icon: 'ic-chart',
      },
      {
        key: 'rel-visitantes',
        path: '/relatorios/rel-visitantes',
        label: 'Visitantes por Mês',
        icon: 'ic-chart',
      },
      { key: 'rel-projetos', path: '/relatorios/rel-projetos', label: 'Projetos', icon: 'ic-chart' },
      {
        key: 'rel-pesquisadores',
        path: '/relatorios/rel-pesquisadores',
        label: 'Pesquisadores por Projeto',
        icon: 'ic-chart',
      },
      {
        key: 'rel-observacoes',
        path: '/relatorios/rel-observacoes',
        label: 'Observações',
        icon: 'ic-chart',
      },
      {
        key: 'rel-estatisticas',
        path: '/relatorios/rel-estatisticas',
        label: 'Estatísticas de Obs.',
        icon: 'ic-chart',
      },
    ],
  },
];
