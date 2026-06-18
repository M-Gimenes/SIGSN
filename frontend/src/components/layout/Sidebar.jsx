import { NavLink } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import { SIDEBAR_SECTIONS } from '../../config/navigation.js';

export default function Sidebar() {
  return (
    <nav id="sidebar">
      <div className="sidebar-brand">
        <div className="mk">
          <Icon name="mark-seal" width={32} height={32} />
          <span className="wm">SIGSN</span>
          <span className="dot" />
        </div>
        <small>Observatório Sidereus Nuncius</small>
      </div>

      <div className="sidebar-nav">
        {SIDEBAR_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="nav-section">{section.title}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.key}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-foot">
        Galileu Galilei, prop.<br />
        R. Pedro Américo, 02<br />
        SIGSN · v 2.0 · MMXXVI
      </div>
    </nav>
  );
}
