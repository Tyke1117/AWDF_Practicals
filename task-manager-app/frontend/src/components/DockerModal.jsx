import React from 'react';

/**
 * DockerModal Component
 * Interactive Docker Compose Orchestration Overview Modal UI
 * Displays real-time / containerized multi-service topology, network, and storage details
 */
export default function DockerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const services = [
    {
      name: 'taskflow-fe (Frontend)',
      image: 'Multi-Stage (node:18-alpine)',
      ports: '5173 -> 5173',
      role: 'React SPA (Vite preview)',
      status: 'Healthy (Running)',
      color: '#06b6d4',
    },
    {
      name: 'taskflow-be (Backend API)',
      image: 'node:18-alpine',
      ports: '5000 -> 5000',
      role: 'Express REST API',
      status: 'Healthy (Running)',
      color: '#10b981',
    },
    {
      name: 'taskflow-db (MongoDB)',
      image: 'mongo:6.0',
      ports: '27017 -> 27017',
      role: 'NoSQL Document Store',
      status: 'Healthy (Running)',
      color: '#f59e0b',
    },
  ];

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🐳</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>
                Docker Compose Orchestration Overview
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                Topology: Multi-Service Stack (TaskFlow Pro) • Single-Command Deployment
              </p>
            </div>
          </div>
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        </div>

        {/* Services Grid */}
        <div style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', margin: '0 0 12px', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Active Services (3 Containers)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {services.map((svc, i) => (
              <div key={i} style={serviceCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{svc.name}</span>
                  <span style={{ ...badgeStyle, backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                    ● {svc.status}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '12px', color: '#475569' }}>
                  <div><strong>Image:</strong> {svc.image}</div>
                  <div><strong>Ports:</strong> <code>{svc.ports}</code></div>
                  <div><strong>Role:</strong> {svc.role}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Network & Storage Specifications */}
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={infoBoxStyle}>
              <h4 style={{ margin: '0 0 6px', fontSize: '13px', color: '#0369a1' }}>🌐 Bridge Network (app-network)</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#334155' }}>
                • <strong>Subnet:</strong> <code>172.20.0.0/16</code><br />
                • <strong>DNS Discovery:</strong> Backend connects via <code>mongodb://mongodb:27017/taskdb</code><br />
                • Automatic container name resolution
              </p>
            </div>
            <div style={infoBoxStyle}>
              <h4 style={{ margin: '0 0 6px', fontSize: '13px', color: '#047857' }}>💾 Named Volume (mongo-data)</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#334155' }}>
                • <strong>Host Mount:</strong> <code>/data/db</code><br />
                • <strong>Persistence:</strong> Full survival across container teardowns<br />
                • Zero administrative data loss on rebuild
              </p>
            </div>
          </div>

          <div style={footerBarStyle}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Command: <code>docker-compose up --build -d</code>
            </span>
            <button style={actionButtonStyle} onClick={onClose}>Close Overview</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const modalStyle = {
  backgroundColor: '#ffffff',
  width: '680px',
  maxWidth: '92vw',
  borderRadius: '12px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const headerStyle = {
  padding: '16px 20px',
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const closeButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  color: '#94a3b8',
  cursor: 'pointer',
  lineHeight: 1,
};

const serviceCardStyle = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '12px 14px',
};

const badgeStyle = {
  padding: '3px 8px',
  borderRadius: '9999px',
  fontSize: '11px',
  fontWeight: 600,
};

const infoBoxStyle = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  padding: '12px',
};

const footerBarStyle = {
  marginTop: '20px',
  paddingTop: '16px',
  borderTop: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const actionButtonStyle = {
  backgroundColor: '#0284c7',
  color: '#ffffff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  fontWeight: 500,
  cursor: 'pointer',
};
