import axios from "axios";

const BASE_URL = "http://localhost:5000/tasks";

export const getTasks = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

export const addTask = async (task) => {
  const res = await axios.post(BASE_URL, task);
  return res.data;
};

export const updateTask = async (id, data) => {
  const res = await axios.put(`${BASE_URL}/${id}`, data);
  return res.data;
};

export const patchTask = async (id, data) => {
  const res = await axios.patch(`${BASE_URL}/${id}`, data);
  return res.data;
};

export const deleteTask = async (id) => {
  await axios.delete(`${BASE_URL}/${id}`);
};

export const bulkDeleteTasks = async (taskIds) => {
  for (const id of taskIds) {
    await axios.delete(`${BASE_URL}/${id}`);
  }
};

export const bulkUpdateTasks = async (taskIds, data) => {
  for (const id of taskIds) {
    await axios.patch(`${BASE_URL}/${id}`, data);
  }
};
