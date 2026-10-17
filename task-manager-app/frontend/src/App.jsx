import React, { useState, useEffect, useCallback, useRef } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import Toast from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import AiAssistantModal from './components/AiAssistantModal';
import { getTasks, createTask, updateTask, deleteTask, getAIStatus } from './services/api';
import './App.css';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [aiInfo, setAiInfo] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTasks();
      if (response && response.success && Array.isArray(response.data)) {
        setTasks(response.data);
      } else if (Array.isArray(response)) {
        setTasks(response);
      } else {
        throw new Error('Unexpected data format received from Express backend');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to Node backend.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAIStatus = useCallback(async () => {
    try {
      const status = await getAIStatus();
      setAiInfo(status);
    } catch (e) {
      // Backend may still be initializing
      setAiInfo({ configured: false, fallbackEnabled: true, model: 'gpt-4o-mini' });
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadAIStatus();
  }, [loadTasks, loadAIStatus]);

  /**
   * Handle Task Creation or Update with Optimistic Updates & AI metadata
   */
  const handleCreateOrUpdateTask = async (taskData) => {
    setIsSubmitting(true);

    if (editingTask) {
      // UPDATE FLOW (PUT /tasks/:id)
      try {
        const response = await updateTask(editingTask.id || editingTask._id, taskData);
        const updatedItem = response.data || response;

        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            (t.id === editingTask.id || t._id === editingTask._id) ? updatedItem : t
          )
        );
        setEditingTask(null);
        showToast('Task updated successfully!', 'success');
      } catch (err) {
        showToast(`Failed to update task: ${err.message}`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // OPTIMISTIC CREATE FLOW (POST /tasks)
      const tempId = `optimistic-${Date.now()}`;
      const optimisticTask = {
        ...taskData,
        id: tempId,
        tempId: tempId,
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };

      // 1. Instantly update local state UI
      setTasks((prevTasks) => [optimisticTask, ...prevTasks]);
      showToast('Creating task... (Optimistic UI Update)', 'success');

      try {
        // 2. Perform backend API request
        const response = await createTask(taskData);
        const savedTask = response.data || response;

        // 3. Replace optimistic task with persistent MongoDB task from backend response
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.tempId === tempId ? savedTask : t))
        );
        showToast('Task persisted to MongoDB!', 'success');
      } catch (err) {
        // 4. Rollback optimistic UI update on error
        setTasks((prevTasks) => prevTasks.filter((t) => t.tempId !== tempId));
        showToast(`Failed to create task: ${err.message}`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  /**
   * Toggle task completion status (PUT /tasks/:id)
   */
  const handleToggleComplete = async (task) => {
    const taskId = task.id || task._id;
    const newStatus = !task.completed;

    // Optimistic toggle
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        (t.id === taskId || t._id === taskId) ? { ...t, completed: newStatus } : t
      )
    );

    try {
      await updateTask(taskId, { completed: newStatus });
      showToast(`Task marked as ${newStatus ? 'completed' : 'pending'}`, 'success');
    } catch (err) {
      // Revert on error
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          (t.id === taskId || t._id === taskId) ? { ...t, completed: task.completed } : t
        )
      );
      showToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  /**
   * Confirmation dialog before deleting a task
   */
  const handlePromptDelete = (task) => {
    setTaskToDelete(task);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    const taskId = taskToDelete.id || taskToDelete._id;
    setIsDeleting(true);

    try {
      await deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((t) => (t.id !== taskId && t._id !== taskId)));
      showToast('Task deleted successfully from MongoDB!', 'success');
      setTaskToDelete(null);
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApplyStudioDraft = (title, description, priority) => {
    setEditingTask({
      title,
      description,
      priority: priority || 'medium',
      completed: false
    });
    showToast('✨ Applied AI Studio draft into task creation form!', 'success');
  };

  return (
    <div className="app">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Task Confirmation"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action will permanently remove the record from MongoDB.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
        isDeleting={isDeleting}
      />

      {/* Interactive AI Assistant Studio Hub Modal */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        aiInfo={aiInfo}
        onApplyToForm={handleApplyStudioDraft}
      />

      {/* Header Matching PDF Pages 7 & 8 */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand">
            <span className="brand-logo">⚡</span>
            <div>
              <h1>TaskFlow Pro</h1>
              <p className="subtitle">Practical 13: AI API Integration into a Web Application (OpenAI / Gemini SDK)</p>
            </div>
          </div>
          <div className="header-badges">
            <div className="connection-badge">
              <span className="status-dot"></span>
              Backend: <code>:5000</code>
            </div>
            {/* Clickable AI Pill Opening Studio Modal */}
            <button
              className="ai-service-badge clickable"
              onClick={() => setIsAiModalOpen(true)}
              title="Open Interactive AI Studio (Prompt Playground & 401 Simulator)"
            >
              <span className="ai-pulse-dot"></span>
              <span>✨ AI Assistant: <strong>Active [GPT-4o-mini]</strong></span>
              <span className="studio-pill-tag">Studio Hub ↗</span>
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="grid-layout">
          <aside className="sidebar">
            <TaskForm
              onSubmit={handleCreateOrUpdateTask}
              editingTask={editingTask}
              onCancelEdit={() => setEditingTask(null)}
              isSubmitting={isSubmitting}
              onNotify={showToast}
            />

            <div className="info-card card">
              <h3>🤖 Practical 13 Architectural Highlights</h3>
              <ul className="info-list">
                <li>
                  <strong>Server-Side Secret:</strong> API keys (<code>OPENAI_API_KEY</code> / <code>GEMINI_API_KEY</code>) stored strictly in backend <code>.env</code> and excluded via <code>.gitignore</code>.
                </li>
                <li>
                  <strong>Graceful Degradation:</strong> If external AI fails, times out, or has an invalid key, the app never crashes; it serves a clean contextual fallback template.
                </li>
                <li>
                  <strong>In-Memory Rate Limiter:</strong> Enforces 5 requests/minute per client IP (HTTP 429) to protect API quotas.
                </li>
                <li>
                  <strong>Editable Suggestion:</strong> AI output populates the form as an editable draft, preserving user agency.
                </li>
                <li>
                  <strong>Responsible AI Disclaimer:</strong> Clear UI indicator and disclaimer ensuring human verification.
                </li>
              </ul>
            </div>
          </aside>

          <section className="content-area">
            <TaskList
              tasks={tasks}
              loading={loading}
              error={error}
              onRetry={loadTasks}
              onToggleComplete={handleToggleComplete}
              onEdit={(task) => setEditingTask(task)}
              onDelete={handlePromptDelete}
            />
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>AWDF Practical 13 • Student ID: <strong>D25DIT079</strong> • React 18 + Node/Express + OpenAI gpt-4o-mini / Gemini + MongoDB</p>
      </footer>
    </div>
  );
}
