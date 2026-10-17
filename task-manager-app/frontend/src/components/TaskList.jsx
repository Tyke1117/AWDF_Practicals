import React from "react";
import TaskItem from "./TaskItem";

export default function TaskList({ tasks, loading, onToggle, onDelete, onInspectSingle }) {
  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 font-medium animate-pulse">
        Fetching tasks from server...
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 border border-dashed border-slate-700 rounded-xl">
        No tasks present in MongoDB. Add a task to initiate caching.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onInspectSingle={onInspectSingle}
        />
      ))}
    </div>
  );
}
