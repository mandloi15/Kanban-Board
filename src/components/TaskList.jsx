import { useContext, useMemo } from "react";
import { BoardContext } from "../context/BoardContext";
import TaskCard from "./TaskCard";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";
import { patchTask } from "../api/tasks";
import { logActivity } from "../api/activity";

function TaskList({ columnId, filters }) {
  const { state, dispatch } = useContext(BoardContext);
  const { tasks } = state;

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => t.columnId === columnId)
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

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredTasks.findIndex(t => t.id === active.id);
    const newIndex = filteredTasks.findIndex(t => t.id === over.id);

    const reordered = arrayMove(filteredTasks, oldIndex, newIndex);

    const updatedTasks = [...tasks];

    for (let i = 0; i < reordered.length; i++) {
      const updated = await patchTask(reordered[i].id, {
        order: i,
        columnId
      });

      const index = updatedTasks.findIndex(t => t.id === updated.id);
      updatedTasks[index] = updated;
    }

    dispatch({ type: "SET_TASKS", payload: updatedTasks });

    await logActivity({
      message: "Reordered tasks",
      time: new Date().toISOString()
    });
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={filteredTasks.map(t => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {filteredTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </SortableContext>
    </DndContext>
  );
}

export default TaskList;
