import { Routes, Route, Navigate } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import EntityPage from './pages/EntityPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import { ENTITY_KEYS } from './config/entities.jsx';
import { REPORT_KEYS } from './config/reports.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            {ENTITY_KEYS.map((key) => (
              <Route key={key} path={`/${key}`} element={<EntityPage entityKey={key} />} />
            ))}
            {REPORT_KEYS.map((key) => (
              <Route key={key} path={`/relatorios/${key}`} element={<ReportPage reportKey={key} />} />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </ThemeProvider>
  );
}
