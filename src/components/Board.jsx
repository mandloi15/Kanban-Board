import { useContext, useMemo, useState } from "react";
import { BoardContext } from "../context/BoardContext";
import ColumnList from "./ColumnList";
import ActivityLog from "./ActivityLog";

function Board() {
  const { state } = useContext(BoardContext);
  const { ui } = state;

  const [filters, setFilters] = useState({
    search: "",
    priority: "",
    assignee: "",
    tag: "",
    sortBy: ""
  });

  const boardData = useMemo(() => {
    return {
      filters
    };
  }, [filters]);

  if (ui.loading) {
    return <p>Loading...</p>;
  }

  if (ui.error) {
    return <p>{ui.error}</p>;
  }

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Main Board Area */}
      <div className="flex-1 overflow-auto">
        <ColumnList boardData={boardData} />
      </div>

      {/* Activity Log Sidebar */}
      <aside className="w-80 bg-white border-l border-gray-200 shadow-sm overflow-auto hidden lg:block">
        <ActivityLog />
      </aside>
    </div>
  );
}

export default Board;
