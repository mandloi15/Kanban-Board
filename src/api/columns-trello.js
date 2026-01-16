// src/api/columns-trello.js
// Column/List API for Trello

import axios from "axios";
import { TRELLO_CONFIG, withAuth, isTrelloEnabled } from "../config/trello";

const MOCK_BASE_URL = "http://localhost:5000/columns";

/* ================================
   GET COLUMNS (Lists in Trello)
================================ */
// Filter to only show these columns
const ALLOWED_COLUMNS = ['to do', 'todo', 'in progress', 'doing', 'done'];

export const getColumns = async () => {
  if (isTrelloEnabled()) {
    const url = withAuth(`${TRELLO_CONFIG.baseUrl}/boards/${TRELLO_CONFIG.boardId}/lists`);
    const res = await axios.get(url);
    
    // Filter and rename columns
    const filtered = res.data
      .filter(list => ALLOWED_COLUMNS.some(name => list.name.toLowerCase().includes(name)))
      .map(list => {
        // Normalize column names
        let title = list.name;
        if (list.name.toLowerCase().includes('to do') || list.name.toLowerCase() === 'todo') {
          title = 'Todo';
        } else if (list.name.toLowerCase().includes('doing') || list.name.toLowerCase().includes('in progress')) {
          title = 'In Progress';
        } else if (list.name.toLowerCase().includes('done')) {
          title = 'Done';
        }
        
        return {
          id: list.id,
          title: title,
          order: list.pos
        };
      });
    
    return filtered;
  } else {
    const res = await axios.get(MOCK_BASE_URL);
    return res.data;
  }
};

/* ================================
   ADD COLUMN (Create List)
================================ */
export const addColumn = async (column) => {
  if (isTrelloEnabled()) {
    const url = withAuth(`${TRELLO_CONFIG.baseUrl}/lists`);
    const res = await axios.post(url, {
      name: column.title,
      idBoard: TRELLO_CONFIG.boardId,
      pos: column.order || 'bottom'
    });
    
    return {
      id: res.data.id,
      title: res.data.name,
      order: res.data.pos
    };
  } else {
    const res = await axios.post(MOCK_BASE_URL, column);
    return res.data;
  }
};

/* ================================
   UPDATE COLUMN (Rename List)
================================ */
export const updateColumn = async (id, data) => {
  if (isTrelloEnabled()) {
    const url = withAuth(`${TRELLO_CONFIG.baseUrl}/lists/${id}`);
    const res = await axios.put(url, {
      name: data.title
    });
    
    return {
      id: res.data.id,
      title: res.data.name,
      order: data.order
    };
  } else {
    const res = await axios.put(`${MOCK_BASE_URL}/${id}`, data);
    return res.data;
  }
};

/* ================================
   DELETE COLUMN (Archive List)
   Note: Trello archives lists, doesn't delete them
================================ */
export const deleteColumn = async (id) => {
  if (isTrelloEnabled()) {
    const url = withAuth(`${TRELLO_CONFIG.baseUrl}/lists/${id}/closed`);
    await axios.put(url, { value: true });
  } else {
    await axios.delete(`${MOCK_BASE_URL}/${id}`);
  }
};
