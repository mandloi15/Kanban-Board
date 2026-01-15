import axios from "axios";

/**
 * Base URL for activity resource
 * JSON Server endpoint
 */
const BASE_URL = "http://localhost:5000/activity";

/**
 * Fetch all activity logs
 * Used in:
 * - App initial load (PHASE 2)
 * - ActivityLog UI (PHASE 9)
 */
export const getActivity = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

/**
 * Log a new activity
 * Used in:
 * - Task create
 * - Task update
 * - Task delete
 * - Task move (DND)
 * - Column delete
 * - Bulk actions
 */
export const logActivity = async ({ message, time }) => {
  const activity = {
    message,
    time: time || new Date().toISOString()
  };

  const res = await axios.post(BASE_URL, activity);
  return res.data;
};

/**
 * Optional: Clear all activity logs (Admin only)
 * Not required, but useful for testing / reset
 */
export const clearActivity = async () => {
  const activities = await getActivity();

  for (const act of activities) {
    await axios.delete(`${BASE_URL}/${act.id}`);
  }
};
