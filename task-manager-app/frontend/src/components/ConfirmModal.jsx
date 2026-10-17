import React from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-warning-icon">🗑️</span>
          <h3>{title || 'Confirm Action'}</h3>
        </div>
        <div className="modal-body">
          <p>{message || 'Are you sure you want to proceed with this action?'}</p>
        </div>
        <div className="modal-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            className="btn btn-danger" 
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
