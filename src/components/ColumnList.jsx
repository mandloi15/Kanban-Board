import { useContext, useMemo, useState } from "react";
import { BoardContext } from "../context/BoardContext";
import Column from "./Column";
import ColumnModal from "./ColumnModal";
import { addColumn, updateColumn } from "../api/columns-trello";
import { logActivity } from "../api/activity-trello";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";
import { isAdmin } from "../utils/permissions";

function ColumnList() {
  const { state, dispatch } = useContext(BoardContext);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    priority: "",
    assignee: "",
    tag: "",
    sortBy: ""
  });

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

  const handleColumnDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedColumns.findIndex(c => c.id === active.id);
    const newIndex = sortedColumns.findIndex(c => c.id === over.id);

    const reordered = arrayMove(sortedColumns, oldIndex, newIndex);

    for (let i = 0; i < reordered.length; i++) {
      await updateColumn(reordered[i].id, { order: i });
    }

    dispatch({ type: "SET_COLUMNS", payload: reordered });
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
      <DndContext collisionDetection={closestCenter} onDragEnd={handleColumnDragEnd}>
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
