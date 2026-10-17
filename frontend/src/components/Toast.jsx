import React, { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className={`toast-container ${toast.type}`}>
      <div className="toast-icon">
        {isSuccess ? '✅' : '❌'}
      </div>
      <div className="toast-message">
        <strong>{isSuccess ? 'Success' : 'Notice'}</strong>
        <p>{toast.message}</p>
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Close notification">
        &times;
      </button>
    </div>
  );
}
