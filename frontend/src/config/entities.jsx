import Pill from '../components/ui/Pill.jsx';
import {
  formatCurrency,
  formatDateOnly,
  formatDateTime,
} from '../utils/format.js';

import AgendamentoForm, {
  agendamentoBody,
  agendamentoEmpty,
  agendamentoFromRecord,
} from '../components/forms/AgendamentoForm.jsx';
import CaravanaForm, {
  caravanaBody,
  caravanaEmpty,
  caravanaFromRecord,
} from '../components/forms/CaravanaForm.jsx';
import ConstelacaoForm, {
  constelacaoBody,
  constelacaoEmpty,
  constelacaoFromRecord,
} from '../components/forms/ConstelacaoForm.jsx';
import CoordenadorForm, {
  coordenadorBody,
  coordenadorEmpty,
  coordenadorFromRecord,
} from '../components/forms/CoordenadorForm.jsx';
import GrupoDePesquisaForm, {
  grupoBody,
  grupoEmpty,
  grupoFromRecord,
} from '../components/forms/GrupoDePesquisaForm.jsx';
import GuiaForm, {
  guiaBody,
  guiaEmpty,
  guiaFromRecord,
} from '../components/forms/GuiaForm.jsx';
import ObservacaoForm, {
  observacaoBody,
  observacaoEmpty,
  observacaoFromRecord,
} from '../components/forms/ObservacaoForm.jsx';
import PesquisadorForm, {
  pesquisadorBody,
  pesquisadorEmpty,
  pesquisadorFromRecord,
} from '../components/forms/PesquisadorForm.jsx';
import ProjetoForm, {
  projetoBody,
  projetoEmpty,
  projetoFromRecord,
} from '../components/forms/ProjetoForm.jsx';

const statusBoolPill = (v) =>
  v ? <Pill value="Ativo" /> : <Pill value="Inativo" />;

export const ENTITIES = {
  agendamentos: {
    label: 'Agendamentos',
    icon: 'ic-schedule',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'dataVisita', label: 'Data da Visita', fmt: formatDateTime },
      { key: 'valorVisita', label: 'Valor', fmt: formatCurrency },
      { key: (r) => r.guia?.nome || r.guiaId, label: 'Guia' },
      { key: (r) => r.caravana?.nome || r.caravanaId, label: 'Caravana' },
      { key: (r) => r.caravana?.tipoCaravana || '—', label: 'Tipo' },
    ],
    Form: AgendamentoForm,
    empty: agendamentoEmpty,
    fromRecord: agendamentoFromRecord,
    toBody: agendamentoBody,
  },

  caravanas: {
    label: 'Caravanas',
    icon: 'ic-caravan',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'nome', label: 'Nome' },
      { key: 'tipoCaravana', label: 'Tipo' },
      { key: 'instituicao', label: 'Instituição' },
      { key: 'responsavel', label: 'Responsável' },
      { key: 'quantidadeVisitantes', label: 'Visitantes' },
    ],
    Form: CaravanaForm,
    empty: caravanaEmpty,
    fromRecord: caravanaFromRecord,
    toBody: caravanaBody,
  },

  constelacoes: {
    label: 'Constelações',
    icon: 'ic-constellation',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'nome', label: 'Nome' },
      { key: 'hemisferio', label: 'Hemisfério' },
      { key: 'periodoVisibilidade', label: 'Visibilidade' },
      { key: 'principaisEstrelas', label: 'Principais Estrelas' },
    ],
    Form: ConstelacaoForm,
    empty: constelacaoEmpty,
    fromRecord: constelacaoFromRecord,
    toBody: constelacaoBody,
  },

  coordenadores: {
    label: 'Coordenadores',
    icon: 'ic-compass',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'nome', label: 'Nome' },
      { key: 'especialidade', label: 'Especialidade' },
      { key: 'email', label: 'E-mail' },
      { key: 'telefone', label: 'Telefone' },
      { key: 'login', label: 'Login' },
      { key: 'status', label: 'Status', render: statusBoolPill },
    ],
    Form: CoordenadorForm,
    empty: coordenadorEmpty,
    fromRecord: coordenadorFromRecord,
    toBody: coordenadorBody,
  },

  'grupos-de-pesquisa': {
    label: 'Grupos de Pesquisa',
    icon: 'ic-group',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'nome', label: 'Nome' },
      { key: 'areaDePesquisa', label: 'Área de Pesquisa' },
      { key: 'dataCriacao', label: 'Criado em', fmt: formatDateOnly },
      {
        key: (r) => (r.pesquisadores || []).length,
        label: 'Pesquisadores',
      },
      { key: 'status', label: 'Status', render: statusBoolPill },
    ],
    Form: GrupoDePesquisaForm,
    empty: grupoEmpty,
    fromRecord: grupoFromRecord,
    toBody: grupoBody,
  },

  guias: {
    label: 'Guias',
    icon: 'ic-book',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'nome', label: 'Nome' },
      { key: 'especialidade', label: 'Especialidade' },
      { key: 'email', label: 'E-mail' },
      { key: 'disponibilidade', label: 'Turno', render: (v) => <Pill value={v} /> },
      { key: 'status', label: 'Status', render: statusBoolPill },
    ],
    Form: GuiaForm,
    empty: guiaEmpty,
    fromRecord: guiaFromRecord,
    toBody: guiaBody,
  },

  observacoes: {
    label: 'Observações',
    icon: 'ic-telescope',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'dataObservacao', label: 'Data', fmt: formatDateOnly },
      { key: (r) => r.projeto?.titulo || r.projetoId, label: 'Projeto' },
      { key: (r) => r.constelacao?.nome || r.constelacaoId, label: 'Constelação' },
      { key: 'versaoObservacao', label: 'Versão' },
      { key: 'instrumentoUtilizado', label: 'Instrumento' },
    ],
    Form: ObservacaoForm,
    empty: observacaoEmpty,
    fromRecord: observacaoFromRecord,
    toBody: observacaoBody,
  },

  pesquisadores: {
    label: 'Pesquisadores',
    icon: 'ic-researcher',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'nome', label: 'Nome' },
      { key: 'especialidade', label: 'Especialidade' },
      { key: 'email', label: 'E-mail' },
      {
        key: (r) =>
          (r.gruposDePesquisa || r.grupos || []).map((g) => g.nome).join(', ') || '—',
        label: 'Grupos',
      },
      { key: 'status', label: 'Status', render: statusBoolPill },
    ],
    Form: PesquisadorForm,
    empty: pesquisadorEmpty,
    fromRecord: pesquisadorFromRecord,
    toBody: pesquisadorBody,
  },

  projetos: {
    label: 'Projetos',
    icon: 'ic-project',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'titulo', label: 'Título' },
      { key: 'areaDePesquisa', label: 'Área' },
      { key: 'status', label: 'Status', render: (v) => <Pill value={v} /> },
      {
        key: (r) => r.grupoDePesquisa?.nome || r.grupoDePesquisaId,
        label: 'Grupo',
      },
      { key: (r) => r.coordenador?.nome || r.coordenadorId, label: 'Coordenador' },
      { key: 'dataInicio', label: 'Início', fmt: formatDateOnly },
    ],
    Form: ProjetoForm,
    empty: projetoEmpty,
    fromRecord: projetoFromRecord,
    toBody: projetoBody,
  },
};

export const ENTITY_KEYS = Object.keys(ENTITIES);
