import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import SvgDefs from './SvgDefs.jsx';
import Toast from '../ui/Toast.jsx';

const DEFAULT_TOPBAR = {
  breadcrumbs: ['Observatório', 'Início'],
  onRefresh: null,
  onNew: null,
  newLabel: 'Novo registro',
  showNew: false,
};

export default function AppLayout() {
  const [topbar, setTopbar] = useState(DEFAULT_TOPBAR);

  const context = useMemo(
    () => ({
      setTopbar: (next) => setTopbar({ ...DEFAULT_TOPBAR, ...next }),
    }),
    [],
  );

  return (
    <>
      <SvgDefs />
      <Toast />
      <div className="app">
        <Sidebar />
        <div id="main">
          <Topbar {...topbar} />
          <div id="content">
            <Outlet context={context} />
          </div>
        </div>
      </div>
    </>
  );
}
