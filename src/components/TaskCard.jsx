import React, { useContext, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BoardContext } from "../context/BoardContext";
import { updateTask, deleteTask } from "../api/tasks-trello";
import { logActivity } from "../api/activity-trello";
import TaskModal from "./TaskModal";
import { isAdmin } from "../utils/permissions";

function TaskCard({ task }) {
  const { state, dispatch } = useContext(BoardContext);
  const [open, setOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: {
        type: "task",
        task
      }
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const priorityColors = {
    high: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
    medium: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", dot: "bg-yellow-500" },
    low: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", dot: "bg-green-500" }
  };

  const priorityClass = priorityColors[task.priority] || priorityColors.low;

  const handleEdit = async (data) => {
    const updated = await updateTask(task.id, { ...task, ...data });
    dispatch({ type: "UPDATE_TASK", payload: updated });

    const activityItem = {
      id: Date.now().toString(),
      message: `Updated task: ${task.title}`,
      time: new Date().toISOString()
    };
    dispatch({ type: "ADD_ACTIVITY", payload: activityItem });
    logActivity(activityItem);

    setOpen(false);
  };

  const handleDelete = async () => {
    if (!isAdmin(state.auth)) {
      console.log("❌ Delete failed: Not admin");
      return;
    }
    if (!window.confirm("Delete this task?")) return;

    try {
      console.log("🗑️ Deleting task:", task.id);
      await deleteTask(task.id);
      console.log("✅ Task deleted from Trello");
      
      dispatch({ type: "DELETE_TASK", payload: task.id });

      const activityItem = {
        id: Date.now().toString(),
        message: `Deleted task: ${task.title}`,
        time: new Date().toISOString()
      };
      dispatch({ type: "ADD_ACTIVITY", payload: activityItem });
      logActivity(activityItem);
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete task: " + err.message);
    }
  };

  const toggleSelect = () => {
    dispatch({ type: "TOGGLE_TASK", payload: task.id });
  };

  const isSelected = state.selectedTasks?.includes(task.id);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          bg-white rounded-lg border-2 transition-all duration-200 cursor-grab active:cursor-grabbing
          hover:shadow-lg p-4 space-y-3 group
          ${isSelected 
            ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-300 ring-opacity-50" 
            : "border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h4
              className="font-bold text-gray-900 truncate hover:text-blue-600 cursor-pointer transition-colors text-sm leading-snug"
              onClick={(e) => { e.stopPropagation(); setOpen(true); }}
              onPointerDown={(e) => e.stopPropagation()}
              title={task.title}
            >
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Tags & Priority */}
        {(task.priority || task.tags) && (
          <div className="flex flex-wrap gap-2">
            {task.priority && (
              <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${priorityClass.bg} ${priorityClass.text} ${priorityClass.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${priorityClass.dot}`}></span>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </div>
            )}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Due Date & Assignee */}
        {(task.dueDate || task.assignee) && (
          <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
            {task.dueDate && (
              <div className="flex items-center gap-1.5">
                <span>📅</span>
                <span className={`font-medium ${new Date(task.dueDate) < new Date() ? 'text-red-600' : ''}`}>
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
            {task.assignee && (
              <div className="flex items-center gap-1.5">
                <span>👤</span>
                <span className="font-medium">{task.assignee}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(true); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:bg-blue-50 px-2 py-1 rounded transition-colors"
          >
            Edit
          </button>
          {isAdmin(state.auth) && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-xs text-red-600 hover:text-red-700 font-bold hover:bg-red-50 px-2 py-1 rounded transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {open && (
        <TaskModal
          initialData={task}
          onClose={() => setOpen(false)}
          onSubmit={handleEdit}
        />
      )}
    </>
  );
}

export default React.memo(TaskCard);
