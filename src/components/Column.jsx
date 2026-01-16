import { useContext, useState } from "react";
import { BoardContext } from "../context/BoardContext";
import TaskList from "./TaskList";
import TaskModal from "./TaskModal";
import ColumnModal from "./ColumnModal";
import { addTask } from "../api/tasks-trello";
import { updateColumn, deleteColumn } from "../api/columns-trello";
import { logActivity } from "../api/activity-trello";
import { isAdmin } from "../utils/permissions";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function Column({ column, filters }) {
  const { state, dispatch } = useContext(BoardContext);
  const [taskOpen, setTaskOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const columnTasks = state.tasks.filter(t => t.columnId == column.id);

  const handleAddTask = async (formData) => {
    setError(null);
    setIsLoading(true);

    try {
      console.log("📤 Step 1: User submitted form data:", formData);

      const taskPayload = {
        title: formData.title,
        description: formData.description || "",
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        assignee: formData.assignee || "",
        tags: formData.tags || [],
        columnId: column.id, // Keep as string for Trello List ID
        order: Date.now(),
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log("📋 Step 2: Prepared payload:", taskPayload);

      console.log(`📤 Step 3: Sending POST /tasks request...`);
      const createdTask = await addTask(taskPayload);
      console.log("📥 Step 4: Backend response (task created):", createdTask);

      console.log("🔄 Step 5: Dispatching ADD_TASK to update global state");
      dispatch({ type: "ADD_TASK", payload: createdTask });

      console.log("📝 Step 6: Logging activity");
      const activityItem = {
        id: Date.now().toString(),
        message: `Task "${createdTask.title}" added to ${column.title}`,
        time: new Date().toISOString()
      };
      dispatch({ type: "ADD_ACTIVITY", payload: activityItem });
      logActivity(activityItem);

      console.log("✅ Step 7: Success! UI will re-render with new task");
      console.log("💾 Step 8: On page refresh, task persists via json-server");

      setTaskOpen(false);
    } catch (err) {
      console.error("❌ Error in add task flow:", err);
      setError(
        err.message || "Failed to create task. Please check your input and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameColumn = async ({ title }) => {
    const updated = await updateColumn(column.id, {
      ...column,
      title
    });

    dispatch({ type: "UPDATE_COLUMN", payload: updated });

    const activityItem = {
      id: Date.now().toString(),
      message: `Column renamed to "${title}"`,
      time: new Date().toISOString()
    };
    dispatch({ type: "ADD_ACTIVITY", payload: activityItem });
    logActivity(activityItem);

    setEditOpen(false);
  };

  const handleDeleteColumn = async () => {
    if (!window.confirm("Delete column and all tasks?")) return;

    await deleteColumn(column.id);

    dispatch({
      type: "DELETE_COLUMN",
      payload: { columnId: column.id }
    });

    const activityItem = {
      id: Date.now().toString(),
      message: `Column "${column.title}" deleted`,
      time: new Date().toISOString()
    };
    dispatch({ type: "ADD_ACTIVITY", payload: activityItem });
    logActivity(activityItem);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex-shrink-0 w-80 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm 
        hover:shadow-lg hover:border-gray-300 transition-all duration-300 
        flex flex-col max-h-[calc(100vh-200px)] overflow-hidden
        ${isDragging ? "opacity-50 shadow-xl" : ""}
      `}
      {...attributes}
      {...listeners}
    >
      {/* Column Header */}
      <div className="px-5 py-4 border-b border-gray-200 bg-white rounded-t-2xl flex items-center justify-between group hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Column Icon */}
          <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
          
          <h3
            className="font-bold text-gray-900 flex-1 cursor-pointer hover:text-blue-600 transition-colors truncate text-base"
            onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}
            onPointerDown={(e) => e.stopPropagation()}
            title={column.title}
          >
            {column.title}
          </h3>
          
          {/* Count Badge */}
          <span className="flex-shrink-0 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
            {columnTasks.length}
          </span>
        </div>

        {isAdmin(state.auth) && (
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteColumn(); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all p-1 hover:bg-red-50 rounded"
            title="Delete column"
          >
            ✕
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-semibold">⚠️ {error}</p>
          <button
            onClick={(e) => { e.stopPropagation(); setError(null); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-xs text-red-600 mt-1 hover:underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tasks Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        <TaskList columnId={column.id} filters={filters} />

        {columnTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">✓</div>
            <p className="text-sm text-gray-400 font-medium">No tasks yet</p>
            <p className="text-xs text-gray-300">Ready to add some work?</p>
          </div>
        )}
      </div>

      {/* Add Task Button */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
        <button
          onClick={(e) => { e.stopPropagation(); setTaskOpen(true); }}
          onPointerDown={(e) => e.stopPropagation()}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 text-sm font-semibold group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span> Saving...
            </>
          ) : (
            <>
              <span className="text-lg group-hover:scale-125 transition-transform">+</span> Add Task
            </>
          )}
        </button>
      </div>

      {/* Modals */}
      {taskOpen && (
        <TaskModal
          onClose={() => {
            setTaskOpen(false);
            setError(null);
          }}
          onSubmit={handleAddTask}
        />
      )}

      {editOpen && (
        <ColumnModal
          initialData={column}
          onClose={() => setEditOpen(false)}
          onSubmit={handleRenameColumn}
        />
      )}
    </div>
  );
}

export default Column;
