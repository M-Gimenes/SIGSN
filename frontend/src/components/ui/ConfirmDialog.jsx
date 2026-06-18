import Modal from './Modal.jsx';

export default function ConfirmDialog({ open, id, entityLabel, onCancel, onConfirm, busy }) {
  return (
    <Modal open={open} onClose={onCancel} width={420}>
      <div className="modal-head">
        <div className="eyebrow">Confirmar exclusão</div>
        <h2>
          <em>Remover</em> registro
        </h2>
      </div>
      <div className="modal-body">
        <div className="confirm-msg">
          Esta ação removerá permanentemente o registro{' '}
          <span className="confirm-id">#{id}</span> de <strong>{entityLabel}</strong>. A operação não pode ser desfeita.
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn-cancel" onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
        <button className="btn-danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Removendo…' : 'Confirmar exclusão'}
        </button>
      </div>
    </Modal>
  );
}
