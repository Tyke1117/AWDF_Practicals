import React from 'react';

export default function Spinner({ label = 'Loading tasks from MongoDB...' }) {
  return (
    <div className="spinner-container">
      <div className="spinner" role="status" aria-label="Loading"></div>
      {label && <p className="spinner-text">{label}</p>}
    </div>
  );
}
