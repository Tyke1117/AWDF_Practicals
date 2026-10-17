import React from "react";

export default function TaskItem({ task, onToggle, onDelete, onInspectSingle }) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task)}
          className="w-4 h-4 rounded border-slate-600 text-sky-500 focus:ring-sky-400 bg-slate-900"
        />
        <div className="truncate">
          <p className={`text-sm font-medium ${task.completed ? "line-through text-slate-500" : "text-white"}`}>
            {task.title}
          </p>
          <span className="text-[10px] text-slate-400 font-mono">ID: {task._id}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
            task.priority === "high"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : task.priority === "low"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
          }`}
        >
          {task.priority || "medium"}
        </span>

        <button
          onClick={() => onInspectSingle(task._id)}
          title="Test Single-Task Caching (GET /tasks/:id)"
          className="text-xs bg-slate-700 hover:bg-sky-600 text-slate-200 px-2 py-1 rounded transition"
        >
          Inspect
        </button>

        <button
          onClick={() => onDelete(task._id)}
          title="Delete Task (Triggers Cache Invalidation)"
          className="text-xs bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white px-2 py-1 rounded border border-rose-500/40 transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
