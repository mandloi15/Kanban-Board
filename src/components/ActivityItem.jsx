import React from "react";

function ActivityItem({ item }) {
  const getActivityIcon = (message) => {
    if (message.includes("added")) return "➕";
    if (message.includes("deleted")) return "🗑️";
    if (message.includes("Updated")) return "✏️";
    if (message.includes("renamed")) return "🏷️";
    if (message.includes("Reordered")) return "🔄";
    return "📝";
  };

  const timeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now - past;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return past.toLocaleDateString();
  };

  return (
    <div className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-default">
      <div className="flex gap-3 items-start">
        <div className="text-lg mt-0.5 flex-shrink-0">
          {getActivityIcon(item.message)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 font-medium leading-snug">
            {item.message}
          </p>
          <time className="text-xs text-gray-500 mt-1 block">
            {timeAgo(item.time)}
          </time>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ActivityItem);
