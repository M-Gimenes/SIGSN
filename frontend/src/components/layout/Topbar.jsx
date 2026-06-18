import { Fragment } from 'react';
import Icon from '../ui/Icon.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function Topbar({ breadcrumbs, onRefresh, onNew, newLabel = 'Novo registro', showNew = false }) {
  const { isDark, toggle } = useTheme();
  return (
    <div className="topbar">
      <div className="breadcrumb">
        {breadcrumbs.map((segment, i) => (
          <Fragment key={i}>
            {i > 0 && <span>·</span>}
            {segment}
          </Fragment>
        ))}
      </div>
      <div className="topbar-actions">
        <button className="btn-ghost" onClick={toggle} title="Alternar tema">
          <Icon name={isDark ? 'ic-sun' : 'ic-moon'} width={13} height={13} />
          <span>{isDark ? 'Claro' : 'Escuro'}</span>
        </button>
        {onRefresh && (
          <button className="btn-ghost" onClick={onRefresh} title="Recarregar">
            <Icon name="ic-refresh" width={12} height={12} />
            Recarregar
          </button>
        )}
        {showNew && onNew && (
          <button className="btn-primary" onClick={onNew}>
            <Icon name="ic-plus" width={12} height={12} />
            {newLabel}
          </button>
        )}
      </div>
    </div>
  );
}
