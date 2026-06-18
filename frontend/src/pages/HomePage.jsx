import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import Icon from '../components/ui/Icon.jsx';

const CARDS = [
  ['/agendamentos', 'ic-schedule', 'Agendamentos', 'Caravanas · Guias · Turnos'],
  ['/projetos', 'ic-project', 'Projetos', 'Pesquisa · Status · Coordenadores'],
  ['/observacoes', 'ic-telescope', 'Observações', 'Constelações · Versões · Datas'],
  ['/caravanas', 'ic-caravan', 'Caravanas', 'Tipos · Visitantes · Escolas'],
  ['/guias', 'ic-book', 'Guias', 'Disponibilidade · Especialidades'],
  ['/constelacoes', 'ic-constellation', 'Constelações', 'Catálogo · Hemisfério'],
  ['/coordenadores', 'ic-compass', 'Coordenadores', 'Gestão de projetos'],
  ['/grupos-de-pesquisa', 'ic-group', 'Grupos de Pesquisa', 'Áreas de Atuação'],
  ['/pesquisadores', 'ic-researcher', 'Pesquisadores', 'Titulações · Grupos'],
];

export default function HomePage() {
  const navigate = useNavigate();
  const { setTopbar } = useOutletContext();

  useEffect(() => {
    setTopbar({ breadcrumbs: ['Observatório', 'Início'] });
  }, [setTopbar]);

  return (
    <div className="welcome">
      <Icon name="mark-seal" className="welcome-mark" />
      <h1>
        Bem-vindo ao
        <br />
        <em>Observatório.</em>
      </h1>
      <p>
        Sistema de Gestão do Observatório Sidereus Nuncius — gerencie agendamentos, pesquisas e
        observações astronômicas.
      </p>
      <div className="welcome-grid">
        {CARDS.map(([path, icon, name, desc]) => (
          <button key={path} className="welcome-card" onClick={() => navigate(path)}>
            <Icon name={icon} width={22} height={22} />
            <div className="wc-name">{name}</div>
            <div className="wc-desc">{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
