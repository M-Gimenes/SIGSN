import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { REPORTS } from '../config/reports.jsx';
import { reportApi } from '../api/services.js';
import { useToast } from '../context/ToastContext.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import ReportFilters from '../components/reports/ReportFilters.jsx';
import ReportResult from '../components/reports/ReportResult.jsx';

export default function ReportPage({ reportKey }) {
  const definition = REPORTS[reportKey];
  const { setTopbar } = useOutletContext();
  const { showToast } = useToast();

  const [filters, setFilters] = useState({});
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    setFilters({});
    setData(null);
    setHasFetched(false);
  }, [reportKey]);

  const generate = useCallback(async () => {
    setLoading(true);
    setHasFetched(true);
    try {
      const result = await reportApi.fetch(definition.endpoint, filters);
      setData(result);
    } catch (err) {
      showToast(err.message || 'Falha ao gerar relatório.', { error: true });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [definition.endpoint, filters, showToast]);

  useEffect(() => {
    setTopbar({
      breadcrumbs: ['Observatório', 'Relatórios', definition.label],
      onRefresh: hasFetched ? generate : null,
      showNew: false,
    });
  }, [definition, generate, hasFetched, setTopbar]);

  const clear = () => {
    setFilters({});
    setData(null);
    setHasFetched(false);
  };

  return (
    <>
      <div className="entity-header">
        <div>
          <h1>
            Relatório · <em>{definition.label}</em>
          </h1>
          <div className="meta">{definition.subtitle}</div>
        </div>
      </div>
      <div className="report-intro">{definition.intro}</div>

      <ReportFilters
        filters={definition.filters}
        values={filters}
        onChange={setFilters}
        onApply={generate}
        onClear={clear}
        busy={loading}
      />

      {loading ? (
        <LoadingState>Gerando relatório…</LoadingState>
      ) : !hasFetched ? (
        <div className="empty-thin">
          Preencha os filtros e clique em <strong>Gerar</strong>.
        </div>
      ) : (
        <ReportResult data={data} definition={definition} />
      )}
    </>
  );
}
