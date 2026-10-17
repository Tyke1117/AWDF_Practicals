import React from 'react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-card" role="alert">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h4>API Communication Error</h4>
        <p>{message || 'Failed to interact with backend database.'}</p>
      </div>
      {onRetry && (
        <button className="btn btn-retry" onClick={onRetry}>
          🔄 Retry Request
        </button>
      )}
    </div>
  );
}
