import { useContext, useMemo } from "react";
import { BoardContext } from "../context/BoardContext";
import TaskCard from "./TaskCard";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

function TaskList({ columnId, filters }) {
  const { state } = useContext(BoardContext);
  const { tasks } = state;

  // Make the column a droppable area for tasks
  const { setNodeRef, isOver } = useDroppable({
    id: `column-drop-${columnId}`,
    data: {
      type: "column",
      columnId
    }
  });

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => t.columnId == columnId)
      .filter(t =>
        !filters?.search ||
        t.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (t.description || "").toLowerCase().includes(filters.search.toLowerCase())
      )
      .filter(t => !filters?.priority || t.priority === filters.priority)
      .filter(t => !filters?.assignee || t.assignee === filters.assignee)
      .filter(t => !filters?.tag || (t.tags || []).includes(filters.tag))
      .sort((a, b) => {
        if (filters?.sort === "dueDate") {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (filters?.sort === "priority") {
          return (a.priority || "").localeCompare(b.priority || "");
        }
        if (filters?.sort === "created") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        return a.order - b.order;
      });
  }, [tasks, columnId, filters]);

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] transition-colors duration-200 rounded-lg p-2 space-y-3 ${
        isOver ? "bg-blue-50 ring-2 ring-blue-300 ring-inset" : ""
      }`}
    >
      <SortableContext
        items={filteredTasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {filteredTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </SortableContext>
      {filteredTasks.length === 0 && (
        <div className={`p-4 text-center text-gray-400 text-sm ${isOver ? "text-blue-500" : ""}`}>
          {isOver ? "Drop task here" : "No tasks"}
        </div>
      )}
    </div>
  );
}

export default TaskList;
