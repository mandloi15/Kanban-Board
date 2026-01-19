import { useContext, useMemo, useState } from "react";
import { BoardContext } from "../context/BoardContext";
import Column from "./Column";
import ColumnModal from "./ColumnModal";
import { addColumn, updateColumn } from "../api/columns-trello";
import { patchTask } from "../api/tasks-trello";
import { logActivity } from "../api/activity-trello";
import {
  DndContext,
  closestCenter,
  pointerWithin,
  rectIntersection,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";
import { isAdmin } from "../utils/permissions";
import TaskCard from "./TaskCard";

function ColumnList() {
  const { state, dispatch } = useContext(BoardContext);
  const [open, setOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    priority: "",
    assignee: "",
    tag: "",
    sortBy: ""
  });

  // Configure sensors to require a small drag distance before starting
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const sortedColumns = useMemo(() => {
    return [...state.columns].sort((a, b) => a.order - b.order);
  }, [state.columns]);

  const handleAddColumn = async ({ title }) => {
    const column = await addColumn({
      title,
      order: state.columns.length
    });
    dispatch({ type: "ADD_COLUMN", payload: column });

    const activityItem = {
      id: Date.now().toString(),
      message: `Column "${title}" created`,
      time: new Date().toISOString()
    };
    dispatch({ type: "ADD_ACTIVITY", payload: activityItem });
    logActivity(activityItem);

    setOpen(false);
  };

  // Custom collision detection that combines algorithms
  const collisionDetectionStrategy = (args) => {
    // First, check if we're over a droppable column area
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    // Fall back to rect intersection
    return rectIntersection(args);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    // Check if dragging a task (not a column)
    const task = state.tasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = state.tasks.find(t => t.id === active.id);
    if (!activeTask) return; // Not dragging a task

    // Determine the target column
    let targetColumnId = null;

    // Check if over a column drop area
    if (over.id.toString().startsWith("column-drop-")) {
      targetColumnId = over.id.toString().replace("column-drop-", "");
    } else {
      // Check if over another task
      const overTask = state.tasks.find(t => t.id === over.id);
      if (overTask) {
        targetColumnId = overTask.columnId;
      }
    }

    // Move task to new column if needed (for visual feedback)
    if (targetColumnId && activeTask.columnId !== targetColumnId) {
      dispatch({
        type: "MOVE_TASK",
        payload: {
          taskId: active.id,
          targetColumnId: targetColumnId
        }
      });
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    // Check if this is a column drag
    const isColumnDrag = sortedColumns.some(c => c.id === active.id);

    if (isColumnDrag) {
      // Handle column reordering
      if (active.id !== over.id) {
        const oldIndex = sortedColumns.findIndex(c => c.id === active.id);
        const newIndex = sortedColumns.findIndex(c => c.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = arrayMove(sortedColumns, oldIndex, newIndex);

          for (let i = 0; i < reordered.length; i++) {
            await updateColumn(reordered[i].id, { order: i });
          }

          dispatch({ type: "SET_COLUMNS", payload: reordered });
        }
      }
      return;
    }

    // Handle task drag
    const activeTaskData = state.tasks.find(t => t.id === active.id);
    if (!activeTaskData) return;

    // Determine the target column
    let targetColumnId = null;
    let targetTaskIndex = -1;

    if (over.id.toString().startsWith("column-drop-")) {
      targetColumnId = over.id.toString().replace("column-drop-", "");
    } else {
      const overTask = state.tasks.find(t => t.id === over.id);
      if (overTask) {
        targetColumnId = overTask.columnId;
        const columnTasks = state.tasks
          .filter(t => t.columnId === targetColumnId)
          .sort((a, b) => a.order - b.order);
        targetTaskIndex = columnTasks.findIndex(t => t.id === over.id);
      }
    }

    if (!targetColumnId) return;

    // Get tasks in the target column
    const columnTasks = state.tasks
      .filter(t => t.columnId === targetColumnId && t.id !== active.id)
      .sort((a, b) => a.order - b.order);

    // Calculate new order
    let newOrder;
    if (targetTaskIndex === -1 || columnTasks.length === 0) {
      // Dropped on empty column or at the end
      newOrder = columnTasks.length > 0 
        ? Math.max(...columnTasks.map(t => t.order)) + 1 
        : 0;
    } else {
      // Dropped on a specific task position
      newOrder = targetTaskIndex;
    }

    // Update task position via API
    try {
      const sourceColumn = state.columns.find(c => c.id == activeTaskData.columnId);
      const targetColumn = state.columns.find(c => c.id == targetColumnId);
      
      const updated = await patchTask(active.id, {
        columnId: targetColumnId,
        order: newOrder
      });

      dispatch({ type: "UPDATE_TASK", payload: { ...activeTaskData, ...updated, columnId: targetColumnId } });

      // Log activity for cross-column moves
      if (activeTaskData.columnId !== targetColumnId) {
        const activityItem = {
          id: Date.now().toString(),
          message: `Moved "${activeTaskData.title}" from "${sourceColumn?.title || 'Unknown'}" to "${targetColumn?.title || 'Unknown'}"`,
          time: new Date().toISOString()
        };
        dispatch({ type: "ADD_ACTIVITY", payload: activityItem });
        logActivity(activityItem);
      }
    } catch (error) {
      console.error("Failed to update task position:", error);
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  if (state.ui.loading) return <p>Loading...</p>;
  if (state.ui.error) return <p>{state.ui.error}</p>;

  return (
    <div className="p-6">
      {/* Top Action Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900">Board</h2>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            {sortedColumns.length} columns
          </span>
        </div>

        {isAdmin(state.auth) && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <span className="text-lg">+</span> Add Column
          </button>
        )}
      </div>

      {/* Columns Container */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={sortedColumns.map(c => c.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 pb-6">
            <div className="flex gap-6 min-w-full">
              {sortedColumns.map(column => (
                <Column
                  key={column.id}
                  column={column}
                  filters={filters}
                />
              ))}

              {/* Empty State - Add First Column */}
              {sortedColumns.length === 0 && (
                <div className="flex items-center justify-center min-h-96 w-96 bg-white rounded-lg border-2 border-dashed border-gray-300 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-gray-500 font-medium">No columns yet</p>
                    <p className="text-sm text-gray-400 mt-1">Create your first column to get started</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SortableContext>

        {/* Drag Overlay - Shows the dragged task */}
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-95 shadow-xl">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {open && (
        <ColumnModal
          onClose={() => setOpen(false)}
          onSubmit={handleAddColumn}
        />
      )}
    </div>
  );
}

export default ColumnList;
