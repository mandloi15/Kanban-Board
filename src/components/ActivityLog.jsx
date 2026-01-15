import { useContext, useMemo } from "react";
import { BoardContext } from "../context/BoardContext";
import ActivityItem from "./ActivityItem";

function ActivityLog() {
  const { state } = useContext(BoardContext);
  const { activity, ui } = state;

  const sortedActivity = useMemo(() => {
    return [...activity].sort(
      (a, b) => new Date(b.time) - new Date(a.time)
    );
  }, [activity]);

  if (ui.loading) {
    return (
      <div className="p-4">
        <p className="text-gray-500 text-sm">Loading activity...</p>
      </div>
    );
  }

  if (ui.error) {
    return (
      <div className="p-4">
        <p className="text-red-600 text-sm">{ui.error}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white sticky top-0">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <span className="text-lg">📋</span>
          Activity Log
        </h3>
        <p className="text-xs text-gray-500 mt-1">Recent board updates</p>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto">
        {sortedActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-gray-500 font-medium text-sm">No activity yet</p>
            <p className="text-gray-400 text-xs mt-1">Actions will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedActivity.map(item => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityLog;
