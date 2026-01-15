import axios from "axios";

/**
 * Base URL for Columns API (JSON Server)
 */
const BASE_URL = "http://localhost:5000/columns";

/**
 * =========================
 * READ
 * =========================
 */

/**
 * Fetch all columns
 * Used in:
 * - App load (Phase 2)
 * - Refresh persistence
 */
export const getColumns = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

/**
 * =========================
 * CREATE
 * =========================
 */

/**
 * Add a new column
 * Used in:
 * - Phase 5 (Add Column)
 */
export const addColumn = async (column) => {
  const response = await axios.post(BASE_URL, column);
  return response.data;
};

/**
 * =========================
 * UPDATE
 * =========================
 */

/**
 * Update entire column (rename, order)
 * Used in:
 * - Phase 5 (Rename Column)
 */
export const updateColumn = async (id, data) => {
  const response = await axios.put(`${BASE_URL}/${id}`, data);
  return response.data;
};

/**
 * Patch column (order update for drag & drop)
 * Used in:
 * - Phase 6 (Column Drag & Drop)
 */
export const patchColumn = async (id, data) => {
  const response = await axios.patch(`${BASE_URL}/${id}`, data);
  return response.data;
};

/**
 * =========================
 * DELETE
 * =========================
 */

/**
 * Delete column
 * Used in:
 * - Phase 5 (Delete Column – Admin Only)
 */
export const deleteColumn = async (id) => {
  await axios.delete(`${BASE_URL}/${id}`);
};
