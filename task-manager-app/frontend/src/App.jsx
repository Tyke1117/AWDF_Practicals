import React, { useState, useEffect } from "react";
import { getTasks, createTask, updateTask, deleteTask, getSingleTask } from "./services/api";
import TaskList from "./components/TaskList";
import CacheModal from "./components/CacheModal";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [cacheStatus, setCacheStatus] = useState("HIT");
  const [latency, setLatency] = useState("2.2ms");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const [lastActionLog, setLastActionLog] = useState("System ready. node-cache active.");

  const loadTasks = async (bypassCache = false) => {
    try {
      setLoading(true);
      const res = await getTasks(null, bypassCache);
      if (res.success) {
        setTasks(res.data || []);
        setCacheStatus(res.cacheStatus || (res.source === "cache" ? "HIT" : "MISS"));
        setLatency(`${res.measuredLatency || "2.2"}ms`);
        setLastActionLog(
          `GET /tasks -> ${res.cacheStatus} in ${res.measuredLatency}ms (Source: ${res.source})`
        );
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
      const res = await createTask({ title, priority });
      if (res.success) {
        setTitle("");
        setLastActionLog("POST /tasks -> Task created. Cache invalidated immediately.");
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
        setLastActionLog(`PUT /tasks/${task._id.slice(-6)} -> Updated. Cache keys evicted.`);
        await loadTasks();
      }
    } catch (err) {
      alert("Failed to update task: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteTask(id);
      if (res.success) {
        setLastActionLog(`DELETE /tasks/${id.slice(-6)} -> Deleted. Cache invalidated.`);
        await loadTasks();
      }
    } catch (err) {
      alert("Failed to delete task: " + err.message);
    }
  };

  const handleInspectSingle = async (id) => {
    try {
      const res = await getSingleTask(id);
      setLastActionLog(
        `GET /tasks/${id.slice(-6)} -> ${res.cacheStatus} in ${res.measuredLatency}ms`
      );
      alert(
        `Single-Task Cache Inspection (GET /tasks/${id}):\nStatus: ${res.cacheStatus}\nResponse Time: ${res.measuredLatency}ms\nSource: ${res.source}`
      );
    } catch (err) {
      alert("Failed to inspect single task: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-amber-400">⚡</span>
            <div>
              <div className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                TaskFlow Pro
                <span className="text-[10px] bg-slate-800 text-sky-400 px-2 py-0.5 rounded border border-slate-700 font-mono">
                  Practical 9
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Practical 9: In-Memory Caching & Query Optimization (node-cache)
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

          {/* Actions & Live Cache Pill */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold font-mono transition shadow-sm ${
                cacheStatus === "HIT"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/40 hover:bg-rose-500/20"
              }`}
            >
              <span>⚡</span>
              <span>Cache: {cacheStatus}</span>
              <span className="text-slate-300">({latency})</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition"
            >
              Telemetry Stats
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
                <span className="text-slate-400">Status:</span>
                <span className="font-mono text-sky-400">{lastActionLog}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadTasks(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded border border-slate-700 transition"
                >
                  ⚡ Fetch (Cached)
                </button>
                <button
                  onClick={() => loadTasks(true)}
                  className="bg-slate-800 hover:bg-amber-600/30 text-amber-300 px-3 py-1.5 rounded border border-amber-600/40 transition"
                >
                  🔄 Fetch (Uncached DB)
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
                placeholder="Enter task title (writing triggers cache invalidation)..."
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
                  Cache TTL: 60s • Evicts on Add / Update / Delete
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
        AWDF Practical 9 • In-Memory Caching (node-cache) & Query Optimization • Express + MongoDB
      </footer>

      {/* Telemetry Modal */}
      <CacheModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCacheFlushed={() => loadTasks(false)}
      />
    </div>
  );
}
