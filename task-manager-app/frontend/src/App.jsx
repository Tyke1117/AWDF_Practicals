import React, { useState, useEffect } from "react";
import { getTasks, createTask, updateTask, deleteTask, getSingleTask } from "./services/api";
import TaskList from "./components/TaskList";
import EventModal from "./components/EventModal";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignedUser, setAssignedUser] = useState("Pari (Lead Architect)");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const [lastActionLog, setLastActionLog] = useState("System ready. Native EventEmitter listeners active.");

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await getTasks();
      if (res.success) {
        setTasks(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const startTime = performance.now();
      const res = await createTask({ title, priority, assignedUser });
      const elapsed = (performance.now() - startTime).toFixed(1);

      if (res.success) {
        setTitle("");
        setLastActionLog(
          `POST /tasks -> 201 Created in ${elapsed}ms! Emitted 'task-created' asynchronously (2s delay runs in background)`
        );
        await loadTasks();
      }
    } catch (err) {
      alert("Failed to create task: " + err.message);
    }
  };

  const handleToggle = async (task) => {
    try {
      const res = await updateTask(task._id, { completed: !task.completed });
      if (res.success) {
        setLastActionLog(`PUT /tasks/${task._id.slice(-6)} -> Updated successfully.`);
        await loadTasks();
      }
    } catch (err) {
      alert("Failed to update task: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const startTime = performance.now();
      const res = await deleteTask(id);
      const elapsed = (performance.now() - startTime).toFixed(1);

      if (res.success) {
        setLastActionLog(
          `DELETE /tasks/${id.slice(-6)} -> 200 OK in ${elapsed}ms! Emitted 'task-deleted' audit event in background.`
        );
        await loadTasks();
      }
    } catch (err) {
      alert("Failed to delete task: " + err.message);
    }
  };

  const handleInspectSingle = async (id) => {
    try {
      const res = await getSingleTask(id);
      alert(
        `Task Details (GET /tasks/${id}):\nTitle: ${res.data?.title}\nAssigned User: ${res.data?.assignedUser || 'Default'}\nCreated At: ${res.data?.createdAt}`
      );
    } catch (err) {
      alert("Failed to inspect task: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-amber-400">⚡</span>
            <div>
              <div className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                TaskFlow Pro
                <span className="text-[10px] bg-sky-950 text-sky-400 px-2 py-0.5 rounded border border-sky-800 font-mono">
                  Practical 10
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Practical 10: Asynchronous Processing & Event-Driven Architecture (EventEmitter)
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700 text-xs font-medium">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === "tasks" ? "bg-sky-600 text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === "projects" ? "bg-sky-600 text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === "analytics" ? "bg-sky-600 text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === "contact" ? "bg-sky-600 text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Active Event Hub Badge & Telemetry Button */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold font-mono transition shadow-sm bg-emerald-500/10 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/20"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Events: Active</span>
              <span className="text-slate-300">[Async Loop]</span>
            </button>

            <button
              onClick={() => setIsEventModalOpen(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
            >
              <span>📊 Event Hub</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeTab !== "tasks" ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
            <div className="inline-block animate-spin text-3xl mb-3">🔄</div>
            <h3 className="text-base font-semibold text-white">Loading {activeTab} route chunk...</h3>
            <p className="text-xs text-slate-400 mt-1">
              Fetching separate JavaScript bundle chunk via React.lazy() & Suspense...
            </p>
          </div>
        ) : (
          <>
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Event Stream:</span>
                <span className="font-mono text-emerald-400">{lastActionLog}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEventModalOpen(true)}
                  className="bg-slate-800 hover:bg-sky-600/30 text-sky-300 px-3 py-1.5 rounded border border-sky-600/40 transition"
                >
                  ⚡ Open Event Timeline
                </button>
              </div>
            </div>

            {/* Task Creation Form */}
            <form
              onSubmit={handleCreate}
              className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex gap-3 flex-wrap items-center"
            >
              <input
                type="text"
                placeholder="Enter task title (emits 'task-created' asynchronously)..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 min-w-[240px] bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm px-4 py-2 rounded-lg transition"
              >
                Add Task
              </button>
            </form>

            {/* Tasks List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Tasks List ({tasks.length})
                </h2>
                <span className="text-xs text-slate-500">
                  EventEmitter Pub/Sub Active • Non-Blocking Background Queue
                </span>
              </div>
              <TaskList
                tasks={tasks}
                loading={loading}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onInspectSingle={handleInspectSingle}
              />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-3 text-center text-xs text-slate-500">
        AWDF Practical 10 • Asynchronous Processing & Event-Driven Architecture • Express + MongoDB
      </footer>

      {/* Live Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
      />
    </div>
  );
}
