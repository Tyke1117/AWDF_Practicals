import React, { useState, useEffect } from 'react';
import PipelineModal from './components/PipelineModal.jsx';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Learn CI/CD Fundamentals', description: 'GitHub Actions concepts', status: 'done' },
    { id: 2, title: 'Write Jest API Tests', description: 'Validate Express routes', status: 'in-progress' },
    { id: 3, title: 'Deploy GitHub Actions Pipeline', description: 'Multi-job lint & test', status: 'pending' }
  ]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ciStatus, setCiStatus] = useState('passing'); // 'passing' or 'failing'

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newTask = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      status: 'pending'
    };
    setTasks([newTask, ...tasks]);
    setTitle('');
    setDescription('');
  };

  const handleStatusChange = (id, newStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const handleDelete = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="taskflow-container">
      {/* Top Navbar matching TaskFlow Pro on Page 7 & 8 */}
      <header className="taskflow-header">
        <div className="header-brand">
          <div className="brand-logo">⚙️</div>
          <div className="brand-titles">
            <h1 className="brand-name">TaskFlow Pro</h1>
            <p className="brand-sub">Practical 12: CI/CD Pipeline with GitHub Actions (Automated Test & Lint)</p>
          </div>
        </div>

        <div className="header-actions">
          {/* Interactive Live CI Pipeline Status Badge */}
          <button 
            className={`ci-badge-btn ${ciStatus === 'passing' ? 'badge-pass' : 'badge-fail'}`}
            onClick={() => setIsModalOpen(true)}
            title="Click to view real-time CI Telemetry Modal"
          >
            <span className="badge-icon">✓</span>
            <span className="badge-text">CI Pipeline: Passing</span>
            <span className="badge-source">GitHub Actions</span>
          </button>

          <nav className="header-nav">
            <a href="#tasks" className="nav-link active">Tasks</a>
            <a href="#projects" className="nav-link">Projects</a>
            <a href="#analytics" className="nav-link">Analytics</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>

          <button className="btn-signin">Sign In / Register</button>
        </div>
      </header>

      {/* Main Board View */}
      <main className="taskflow-main">
        {/* New Task Form */}
        <section className="task-form-panel">
          <h2>Create New Task</h2>
          <form onSubmit={handleAddTask} className="task-form">
            <input 
              type="text" 
              placeholder="Task Title (Required)" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="input-text"
              required
            />
            <input 
              type="text" 
              placeholder="Description (Optional)" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="input-text"
            />
            <button type="submit" className="btn-add">+ Add Task</button>
          </form>
        </section>

        {/* Task Columns Board */}
        <div className="board-grid">
          {['pending', 'in-progress', 'done'].map((columnStatus) => (
            <div key={columnStatus} className={`board-column col-${columnStatus}`}>
              <div className="col-header">
                <h3>{columnStatus === 'pending' ? 'Pending' : columnStatus === 'in-progress' ? 'In Progress' : 'Completed'}</h3>
                <span className="col-count">
                  {tasks.filter(t => t.status === columnStatus).length}
                </span>
              </div>

              <div className="col-tasks">
                {tasks.filter(t => t.status === columnStatus).map(task => (
                  <div key={task.id} className="task-card">
                    <h4>{task.title}</h4>
                    {task.description && <p>{task.description}</p>}
                    <div className="task-card-actions">
                      {columnStatus !== 'pending' && (
                        <button onClick={() => handleStatusChange(task.id, 'pending')} className="btn-move">←</button>
                      )}
                      {columnStatus !== 'in-progress' && (
                        <button onClick={() => handleStatusChange(task.id, 'in-progress')} className="btn-move">⟳</button>
                      )}
                      {columnStatus !== 'done' && (
                        <button onClick={() => handleStatusChange(task.id, 'done')} className="btn-move">→</button>
                      )}
                      <button onClick={() => handleDelete(task.id)} className="btn-del">×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Banner */}
      <footer className="taskflow-footer">
        <span>AWDF Practical 12 • Automated CI/CD Pipeline with GitHub Actions (Student: D25DIT079)</span>
      </footer>

      {/* Supplementary Problem 2: Telemetry Modal */}
      <PipelineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
