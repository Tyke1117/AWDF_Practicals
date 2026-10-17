import React, { useState, useEffect } from 'react';
import { getProjects } from '../services/api';

/**
 * Projects Page (Lazy Loaded Chunk)
 * 
 * Code-split chunk: `Projects-[hash].js` (~15 KB).
 * Downloaded asynchronously ONLY when the user navigates to `/projects`.
 */
export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjectsData() {
      try {
        const res = await getProjects();
        if (res && res.data) {
          setProjects(res.data);
        }
      } catch (err) {
        console.error('Failed to load projects', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjectsData();
  }, []);

  return (
    <div className="page-container page-projects">
      {/* Code Splitting Header Tag */}
      <div className="chunk-route-indicator">
        <span className="route-pulse"></span>
        <span>
          <strong>Route-Based Chunk Active:</strong> <code>Projects.chunk.js</code> was downloaded on-demand when accessing <code>/projects</code>.
        </span>
      </div>

      <section className="projects-hero">
        <h1 className="page-heading">Project Portfolios & Milestones</h1>
        <p className="page-subheading">
          Organize development workflows, sprints, and deliverable targets across cross-functional teams.
        </p>
      </section>

      {loading ? (
        <div className="loading-state-card">
          <div className="mini-spinner"></div>
          <span>Loading project milestones...</span>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((proj) => (
            <div key={proj.id} className="project-card">
              <div className="project-card-header">
                <div
                  className="project-color-pip"
                  style={{ backgroundColor: proj.color || '#6366f1' }}
                ></div>
                <div className="project-header-text">
                  <h3 className="project-name">{proj.name}</h3>
                  <span className="project-id-badge">{proj.id}</span>
                </div>
              </div>

              <p className="project-desc">{proj.description}</p>

              <div className="project-progress-box">
                <div className="progress-labels">
                  <span>Sprint Progress</span>
                  <strong>{proj.progress}%</strong>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${proj.progress}%`,
                      backgroundColor: proj.color || '#6366f1'
                    }}
                  ></div>
                </div>
              </div>

              <div className="project-card-footer">
                <div className="project-stat">
                  <span className="stat-num">{proj.taskCount || 0}</span>
                  <span className="stat-label">Active Tasks</span>
                </div>
                <button
                  type="button"
                  className="btn-outline-sm"
                  onClick={() => alert(`Navigating to sprint board for "${proj.name}"`)}
                >
                  View Tasks →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
