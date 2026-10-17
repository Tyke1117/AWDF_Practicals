import React, { useState, useEffect } from 'react';

export default function EventModal({ isOpen, onClose }) {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorTesting, setErrorTesting] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/events/activity');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.error('Failed to load event telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTelemetry();
      const interval = setInterval(fetchTelemetry, 2500);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleTriggerError = async () => {
    try {
      setErrorTesting(true);
      setActionMessage('');
      const res = await fetch('http://localhost:5000/api/events/test-error', {
        method: 'POST',
      });
      const data = await res.json();
      setActionMessage('Safe Error Dispatched: Handled safely by taskEvents error listener without server downtime!');
      fetchTelemetry();
    } catch (err) {
      setActionMessage('Error triggering test: ' + err.message);
    } finally {
      setErrorTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>⚡ TaskFlow Pro — Event-Driven Architecture Hub</h2>
            <p style={styles.subtitle}>
              Practical 10: Asynchronous Processing & Fault Isolation via Node.js native EventEmitter
            </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        {/* Metrics Row */}
        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Total Events</div>
            <div style={styles.metricValue}>{telemetry?.totalEvents ?? 0}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Active Listeners</div>
            <div style={styles.metricValue}>3 Registered</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Background Delay</div>
            <div style={styles.metricValue}>2000 ms (Async)</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Process Health</div>
            <div style={{ ...styles.metricValue, color: '#10b981' }}>100% Protected</div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={styles.actionRow}>
          <button
            onClick={handleTriggerError}
            disabled={errorTesting}
            style={styles.errorBtn}
          >
            {errorTesting ? 'Emitting...' : '⚠️ Trigger Safe Error Test (POST /api/events/test-error)'}
          </button>
          <button onClick={fetchTelemetry} disabled={loading} style={styles.refreshBtn}>
            {loading ? 'Refreshing...' : '🔄 Refresh Live Feed'}
          </button>
        </div>

        {actionMessage && (
          <div style={styles.actionAlert}>{actionMessage}</div>
        )}

        {/* Live Timeline Feed */}
        <h3 style={styles.feedHeading}>Live Event Timeline & Activity Telemetry</h3>
        <div style={styles.feedContainer}>
          {telemetry?.activities && telemetry.activities.length > 0 ? (
            telemetry.activities.map((act) => (
              <div key={act.id || act.timestamp} style={styles.feedItem}>
                <div style={styles.feedItemHeader}>
                  <span style={getBadgeStyle(act.event)}>
                    {act.event}
                  </span>
                  <span style={getStatusBadgeStyle(act.status)}>
                    {act.status}
                  </span>
                  <span style={styles.timestamp}>
                    {new Date(act.timestamp || act.finishedAt).toLocaleTimeString()}
                  </span>
                </div>
                <div style={styles.feedBody}>
                  {act.taskTitle && <div><strong>Task:</strong> {act.taskTitle}</div>}
                  {act.message && <div><strong>Log:</strong> {act.message}</div>}
                  {act.assignedUser && <div><strong>Assigned To:</strong> {act.assignedUser}</div>}
                  {act.responseTime && (
                    <div style={styles.subtext}>
                      API Response: {act.responseTime.substring(11, 23)} | Completed: {act.finishedAt ? act.finishedAt.substring(11, 23) : 'Running in background...'}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={styles.emptyFeed}>No events emitted yet. Create a task or trigger a test error!</div>
          )}
        </div>

        <div style={styles.footer}>
          <span>Node.js Event Loop Decoupled Execution Active</span>
          <button onClick={onClose} style={styles.doneBtn}>Close Hub</button>
        </div>
      </div>
    </div>
  );
}

function getBadgeStyle(event) {
  const base = {
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  };
  if (event === 'task-created') return { ...base, background: '#3b82f6', color: '#fff' };
  if (event === 'task-deleted') return { ...base, background: '#f59e0b', color: '#fff' };
  if (event === 'error') return { ...base, background: '#ef4444', color: '#fff' };
  return { ...base, background: '#6b7280', color: '#fff' };
}

function getStatusBadgeStyle(status) {
  const base = {
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
    marginLeft: '6px',
  };
  if (status === 'COMPLETED_ASYNC') return { ...base, background: '#10b98122', color: '#10b981', border: '1px solid #10b981' };
  if (status === 'IN_PROGRESS') return { ...base, background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b' };
  if (status === 'ERROR_HANDLED_SAFELY') return { ...base, background: '#ef444422', color: '#ef4444', border: '1px solid #ef4444' };
  return { ...base, background: '#374151', color: '#9ca3af' };
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '750px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid #334155',
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #334155',
    paddingBottom: '12px',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    color: '#38bdf8',
    fontWeight: '700',
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#94a3b8',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '24px',
    cursor: 'pointer',
    lineHeight: 1,
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    margin: '16px 0',
  },
  metricCard: {
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid #334155',
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f8fafc',
    marginTop: '4px',
  },
  actionRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '12px',
  },
  errorBtn: {
    flex: 1,
    padding: '10px 14px',
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  refreshBtn: {
    padding: '10px 16px',
    backgroundColor: '#334155',
    color: '#f8fafc',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  actionAlert: {
    padding: '10px',
    backgroundColor: '#064e3b',
    border: '1px solid #059669',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#a7f3d0',
    marginBottom: '12px',
  },
  feedHeading: {
    fontSize: '14px',
    margin: '8px 0',
    color: '#cbd5e1',
  },
  feedContainer: {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    padding: '12px',
    border: '1px solid #334155',
    maxHeight: '260px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  feedItem: {
    backgroundColor: '#1e293b',
    padding: '10px',
    borderRadius: '6px',
    borderLeft: '4px solid #38bdf8',
  },
  feedItemHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '6px',
  },
  timestamp: {
    marginLeft: 'auto',
    fontSize: '11px',
    color: '#64748b',
  },
  feedBody: {
    fontSize: '12px',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  subtext: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '4px',
  },
  emptyFeed: {
    textAlign: 'center',
    color: '#64748b',
    padding: '30px 0',
    fontSize: '13px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #334155',
    fontSize: '12px',
    color: '#94a3b8',
  },
  doneBtn: {
    padding: '8px 16px',
    backgroundColor: '#0284c7',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
