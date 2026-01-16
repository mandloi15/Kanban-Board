// src/api/tasks.js  
// All Task-related API calls - Supports both Mock API and Trello API

import axios from "axios";
import { TRELLO_CONFIG, withAuth, isTrelloEnabled } from "../config/trello";

const MOCK_BASE_URL = "http://localhost:5000/tasks";

/* ================================
   FETCH TASKS (Cards in Trello)
================================ */
export const getTasks = async () => {
  if (isTrelloEnabled()) {
    const url = withAuth(`${TRELLO_CONFIG.baseUrl}/boards/${TRELLO_CONFIG.boardId}/cards`);
    const res = await axios.get(url);
    
    // Map Trello cards to your task structure
    return res.data.map(card => ({
      id: card.id,
      title: card.name,
      description: card.desc || '',
      priority: (card.labels || []).find(l => ['low', 'medium', 'high'].includes(l.name?.toLowerCase()))?.name?.toLowerCase() || 'medium',
      dueDate: card.due || null,
      assignee: (card.members && card.members[0]?.fullName) || '',
      tags: (card.labels || []).map(l => l.name).filter(n => n && !['low', 'medium', 'high'].includes(n.toLowerCase())),
      columnId: card.idList,
      order: card.pos,
      completed: card.dueComplete || false,
      createdAt: card.dateLastActivity,
      updatedAt: card.dateLastActivity
    }));
  } else {
    const res = await axios.get(MOCK_BASE_URL);
    return res.data;
  }
};

/* ================================
   ADD TASK (Create Card in Trello)
================================ */
export const addTask = async (task) => {
  if (isTrelloEnabled()) {
    const url = withAuth(`${TRELLO_CONFIG.baseUrl}/cards`);
    const res = await axios.post(url, {
      name: task.title,
      desc: task.description,
      idList: task.columnId, // This should be a Trello List ID
      due: task.dueDate,
      pos: task.order || 'bottom'
    });
    
    return {
      id: res.data.id,
      title: res.data.name,
      description: res.data.desc,
      priority: task.priority,
      dueDate: res.data.due,
      assignee: task.assignee,
      tags: task.tags || [],
      columnId: res.data.idList,
      order: res.data.pos,
      completed: false,
      createdAt: res.data.dateLastActivity,
      updatedAt: res.data.dateLastActivity
    };
  } else {
    const res = await axios.post(MOCK_BASE_URL, task);
    return res.data;
  }
};

/* ================================
   UPDATE TASK (Full Update)
================================ */
export const updateTask = async (id, data) => {
  if (isTrelloEnabled()) {
    const url = withAuth(`${TRELLO_CONFIG.baseUrl}/cards/${id}`);
    const res = await axios.put(url, {
      name: data.title,
      desc: data.description,
      due: data.dueDate,
      idList: data.columnId
    });
    
    return {
      id: res.data.id,
      title: res.data.name,
      description: res.data.desc,
      priority: data.priority,
      dueDate: res.data.due,
      assignee: data.assignee,
      tags: data.tags || [],
      columnId: res.data.idList,
      order: res.data.pos,
      completed: data.completed,
      createdAt: data.createdAt,
      updatedAt: res.data.dateLastActivity
    };
  } else {
    const res = await axios.put(`${MOCK_BASE_URL}/${id}`, data);
    return res.data;
  }
};

/* ================================
   PATCH TASK (Partial Update - Drag & Drop)
================================ */
export const patchTask = async (id, data) => {
  if (isTrelloEnabled()) {
    const url = withAuth(`${TRELLO_CONFIG.baseUrl}/cards/${id}`);
    const payload = {};
    
    if (data.title) payload.name = data.title;
    if (data.description !== undefined) payload.desc = data.description;
    if (data.columnId) payload.idList = data.columnId;
    if (data.order !== undefined) payload.pos = data.order;
    if (data.dueDate) payload.due = data.dueDate;
    
    const res = await axios.put(url, payload);
    return {
      ...data,
      id: res.data.id,
      updatedAt: res.data.dateLastActivity
    };
  } else {
    const res = await axios.patch(`${MOCK_BASE_URL}/${id}`, data);
    return res.data;
  }
};

/* ================================
   DELETE TASK
================================ */
export const deleteTask = async (id) => {
  if (isTrelloEnabled()) {
    const url = withAuth(`${TRELLO_CONFIG.baseUrl}/cards/${id}`);
    await axios.delete(url);
  } else {
    await axios.delete(`${MOCK_BASE_URL}/${id}`);
  }
};

/* ================================
   BULK DELETE TASKS
================================ */
export const bulkDeleteTasks = async (taskIds) => {
  for (const id of taskIds) {
    await deleteTask(id);
  }
};

/* ================================
   BULK UPDATE TASKS
================================ */
export const bulkUpdateTasks = async (taskIds, data) => {
  for (const id of taskIds) {
    await patchTask(id, data);
  }
};
