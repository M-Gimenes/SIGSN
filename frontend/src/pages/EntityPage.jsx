import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { ENTITIES } from '../config/entities.jsx';
import { entityApi } from '../api/services.js';
import { ApiError } from '../api/client.js';
import { clearFkCache } from '../hooks/useFkOptions.js';
import { useToast } from '../context/ToastContext.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import EntityFormModal from '../components/forms/EntityFormModal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';

export default function EntityPage({ entityKey }) {
  const definition = ENTITIES[entityKey];
  const { setTopbar } = useOutletContext();
  const { showToast } = useToast();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await entityApi.list(entityKey);
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Erro ao carregar.', { error: true });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [entityKey, showToast]);

  useEffect(() => {
    setTopbar({
      breadcrumbs: ['Observatório', definition.label],
      onRefresh: load,
      onNew: () => {
        setEditing(null);
        setModalOpen(true);
      },
      showNew: true,
    });
  }, [definition, load, setTopbar]);

  useEffect(() => {
    load();
  }, [load]);

  const handleEdit = (record) => {
    setEditing(record);
    setModalOpen(true);
  };

  const handleSaved = (wasEdit) => {
    setModalOpen(false);
    setEditing(null);
    clearFkCache(`/${entityKey}`);
    showToast(wasEdit ? 'Registro atualizado.' : 'Registro criado.');
    load();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      await entityApi.remove(entityKey, deleteTarget.id);
      clearFkCache(`/${entityKey}`);
      showToast('Registro removido.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      if (err instanceof ApiError) showToast(err.message, { error: true });
      else showToast('Não foi possível remover.', { error: true });
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <div className="entity-header">
        <div>
          <h1>
            {definition.label}{' '}
            {rows.length > 0 && (
              <em>
                <span className="count-badge">{rows.length}</span>
              </em>
            )}
          </h1>
          <div className="meta">Gestão · Observatório Sidereus Nuncius</div>
        </div>
      </div>

      {loading ? (
        <LoadingState>Carregando…</LoadingState>
      ) : rows.length === 0 ? (
        <div className="table-wrap">
          <EmptyState hint='Use "Novo registro" para criar o primeiro.'>
            Nenhum registro encontrado.
          </EmptyState>
        </div>
      ) : (
        <DataTable
          columns={definition.columns}
          rows={rows}
          onEdit={handleEdit}
          onDelete={(row) => setDeleteTarget(row)}
        />
      )}

      <EntityFormModal
        open={modalOpen}
        entity={entityKey}
        definition={definition}
        record={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        id={deleteTarget?.id}
        entityLabel={definition.label}
        busy={deleteBusy}
        onCancel={() => !deleteBusy && setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
