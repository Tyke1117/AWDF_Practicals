import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

/**
 * Supplementary Problem 1: Heavy Third-Party Component
 * 
 * Bundles Chart.js + react-chartjs-2 (~180 KB uncompressed).
 * By isolating this into its own chunk, the main app and other routes
 * do NOT incur the weight of Chart.js until the user explicitly requests analytics.
 */
export default function HeavyChart({ analyticsData }) {
  const { summary, priorityDistribution, weeklyVelocity } = analyticsData || {
    summary: { total: 5, completed: 2, inProgress: 2, pending: 1, completionRate: 40 },
    priorityDistribution: { high: 3, medium: 1, low: 1 },
    weeklyVelocity: [
      { day: 'Mon', completed: 3, created: 5 },
      { day: 'Tue', completed: 4, created: 2 },
      { day: 'Wed', completed: 6, created: 4 },
      { day: 'Thu', completed: 5, created: 3 },
      { day: 'Fri', completed: 8, created: 6 },
      { day: 'Sat', completed: 4, created: 1 },
      { day: 'Sun', completed: 2, created: 0 }
    ]
  };

  // Bar Chart Data for Velocity
  const barData = {
    labels: weeklyVelocity.map((v) => v.day),
    datasets: [
      {
        label: 'Tasks Completed',
        data: weeklyVelocity.map((v) => v.completed),
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        borderColor: 'rgb(79, 70, 229)',
        borderWidth: 1,
        borderRadius: 6
      },
      {
        label: 'Tasks Created',
        data: weeklyVelocity.map((v) => v.created),
        backgroundColor: 'rgba(168, 85, 247, 0.5)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'Plus Jakarta Sans', size: 12 } } },
      title: {
        display: true,
        text: 'Team Velocity & Throughput (Weekly)',
        font: { family: 'Plus Jakarta Sans', size: 15, weight: '700' }
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(226, 232, 240, 0.6)' } },
      x: { grid: { display: false } }
    }
  };

  // Doughnut Chart Data for Priority Distribution
  const doughnutData = {
    labels: ['High Priority', 'Medium Priority', 'Low Priority'],
    datasets: [
      {
        data: [
          priorityDistribution.high || 3,
          priorityDistribution.medium || 1,
          priorityDistribution.low || 1
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(16, 185, 129, 0.85)'
        ],
        borderColor: ['#fff', '#fff', '#fff'],
        borderWidth: 2
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { family: 'Plus Jakarta Sans', size: 12 } } },
      title: {
        display: true,
        text: 'Priority Distribution',
        font: { family: 'Plus Jakarta Sans', size: 15, weight: '700' }
      }
    }
  };

  return (
    <div className="heavy-chart-wrapper">
      <div className="chunk-tag-banner">
        <span className="pulse-indicator"></span>
        <span>
          <strong>Heavy Third-Party Component Loaded:</strong> <code>Chart.js + react-chartjs-2</code> (~180 KB vendor chunk isolated)
        </span>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-canvas-container" style={{ height: '300px' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-canvas-container" style={{ height: '300px' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
