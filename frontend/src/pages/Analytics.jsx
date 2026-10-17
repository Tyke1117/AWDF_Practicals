import React, { useState, useEffect, lazy, Suspense } from 'react';
import { getAnalyticsData } from '../services/api';

/**
 * Supplementary Problem 1: Component-Level Code Splitting
 * 
 * Notice that HeavyChart (which pulls in Chart.js + react-chartjs-2 ~180 KB)
 * is NOT imported statically. It is dynamically imported with React.lazy()!
 */
const HeavyChart = lazy(() => import('../components/HeavyChart'));

function ChartLoadingSkeleton() {
  return (
    <div className="chart-skeleton-box shimmer" role="status">
      <div className="skeleton-bar" style={{ width: '40%', height: '24px', marginBottom: '16px' }}></div>
      <div className="skeleton-bar" style={{ width: '100%', height: '240px', borderRadius: '8px' }}></div>
      <p style={{ marginTop: '12px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
        ⏳ Downloading isolated <code>chart-vendor-[hash].js</code> chunk...
      </p>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChart, setShowChart] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getAnalyticsData();
        if (res && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="page-container page-analytics">
      {/* Route Chunk Banner */}
      <div className="chunk-route-indicator">
        <span className="route-pulse pulse-purple"></span>
        <span>
          <strong>Route Chunk Loaded:</strong> <code>Analytics.chunk.js</code> (~10 KB) loaded.
        </span>
      </div>

      <section className="analytics-hero">
        <h1 className="page-heading">Performance & Velocity Analytics</h1>
        <p className="page-subheading">
          Real-time metrics, sprint velocity charts, and completion distributions.
        </p>
      </section>

      {/* Top Metric Cards */}
      <div className="metric-cards-grid">
        <div className="metric-card">
          <div className="metric-icon bg-indigo">📈</div>
          <div className="metric-content">
            <span className="metric-label">Completion Rate</span>
            <span className="metric-value">{data?.summary?.completionRate || 0}%</span>
            <span className="metric-delta text-success">
              {data?.summary?.completed || 0} of {data?.summary?.total || 0} done
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon bg-amber">🟡</div>
          <div className="metric-content">
            <span className="metric-label">Pending</span>
            <span className="metric-value">{data?.summary?.pending || 0}</span>
            <span className="metric-delta text-warning">Awaiting start</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon bg-indigo">🔵</div>
          <div className="metric-content">
            <span className="metric-label">In Progress</span>
            <span className="metric-value">{data?.summary?.inProgress || 0}</span>
            <span className="metric-delta text-warning">Active development</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon bg-green">🟢</div>
          <div className="metric-content">
            <span className="metric-label">Completed</span>
            <span className="metric-value">{data?.summary?.completed || 0}</span>
            <span className="metric-delta text-success">Sprint on target</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon bg-rose">🚨</div>
          <div className="metric-content">
            <span className="metric-label">High Priority</span>
            <span className="metric-value">{data?.priorityDistribution?.high || 0}</span>
            <span className="metric-delta text-danger">Requires attention</span>
          </div>
        </div>
      </div>

      {/* Supplementary Problem 1 Demonstration Section */}
      <div className="chart-feature-card">
        <div className="chart-feature-header">
          <div>
            <h3 className="chart-feature-title">
              📊 Supplementary Problem 1: Heavy Third-Party Component Splitting
            </h3>
            <p className="chart-feature-subtitle">
              The chart below utilizes <strong>Chart.js</strong>. To optimize performance, it is isolated in its own chunk and loaded via <code>React.lazy()</code> with a dedicated <code>Suspense</code> fallback!
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowChart(!showChart)}
          >
            {showChart ? 'Unmount Chart' : 'Mount Lazy Chart'}
          </button>
        </div>

        {showChart && (
          <Suspense fallback={<ChartLoadingSkeleton />}>
            <HeavyChart analyticsData={data} />
          </Suspense>
        )}
      </div>
    </div>
  );
}
