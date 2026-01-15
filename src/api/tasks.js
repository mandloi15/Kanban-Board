// src/api/tasks.js
// All Task-related API calls live here
// Used across PHASE 1 → PHASE 9

import axios from "axios";

const BASE_URL = "http://localhost:5000/tasks";

/* ================================
   FETCH TASKS
   Used in PHASE 2 (Initial Load)
================================ */
export const getTasks = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

/* ================================
   ADD TASK
   Used in PHASE 4 (Create Task)
================================ */
export const addTask = async (task) => {
  const res = await axios.post(BASE_URL, task);
  return res.data;
};

/* ================================
   UPDATE TASK (FULL UPDATE)
   Used in PHASE 4 (Edit Task)
================================ */
export const updateTask = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/${id}`, data);
  return res.data;
};

/* ================================
   PATCH TASK (PARTIAL UPDATE)
   Used in:
   - PHASE 6 (Drag & Drop)
   - PHASE 8 (Bulk Move / Priority)
================================ */
export const patchTask = async (id, data) => {
  const res = await axios.patch(`${BASE_URL}/${id}`, data);
  return res.data;
};

/* ================================
   DELETE TASK
   Used in:
   - PHASE 4 (Single Delete)
   - PHASE 8 (Bulk Delete)
================================ */
export const deleteTask = async (id) => {
  await axios.delete(`${BASE_URL}/${id}`);
};

/* ================================
   BULK DELETE TASKS (Helper)
   Used in PHASE 8
================================ */
export const bulkDeleteTasks = async (taskIds) => {
  for (const id of taskIds) {
    await axios.delete(`${BASE_URL}/${id}`);
  }
};

/* ================================
   BULK UPDATE TASKS (Helper)
   Used in PHASE 8 (Move / Priority)
================================ */
export const bulkUpdateTasks = async (taskIds, data) => {
  for (const id of taskIds) {
    await axios.patch(`${BASE_URL}/${id}`, data);
  }
};
