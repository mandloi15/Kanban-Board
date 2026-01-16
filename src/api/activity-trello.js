// src/api/activity-trello.js
// Activity API - Supports both Mock API and Trello Actions

import axios from "axios";
import { TRELLO_CONFIG, withAuth, isTrelloEnabled } from "../config/trello";

const MOCK_BASE_URL = "http://localhost:5000/activity";

/**
 * Fetch all activity logs
 * For Trello: fetches board actions
 * For Mock: fetches from json-server
 */
export const getActivity = async () => {
  if (isTrelloEnabled()) {
    try {
      const url = withAuth(`${TRELLO_CONFIG.baseUrl}/boards/${TRELLO_CONFIG.boardId}/actions?limit=20`);
      const res = await axios.get(url);
      
      // Map Trello actions to your activity structure
      return res.data.map(action => ({
        id: action.id,
        message: formatTrelloAction(action),
        time: action.date
      }));
    } catch (err) {
      console.warn("Could not fetch Trello actions:", err.message);
      return []; // Return empty array if actions fail
    }
  } else {
    const res = await axios.get(MOCK_BASE_URL);
    return res.data;
  }
};

/**
 * Format Trello action into readable message
 */
const formatTrelloAction = (action) => {
  const type = action.type;
  const data = action.data;
  
  switch (type) {
    case 'createCard':
      return `Card "${data.card?.name}" created in ${data.list?.name}`;
    case 'updateCard':
      if (data.listAfter) {
        return `Card "${data.card?.name}" moved to ${data.listAfter?.name}`;
      }
      return `Card "${data.card?.name}" updated`;
    case 'deleteCard':
      return `Card deleted from ${data.list?.name}`;
    case 'createList':
      return `List "${data.list?.name}" created`;
    case 'updateList':
      return `List "${data.list?.name}" updated`;
    case 'commentCard':
      return `Comment added to "${data.card?.name}"`;
    default:
      return `${type.replace(/([A-Z])/g, ' $1').trim()}`;
  }
};

/**
 * Log a new activity
 * For Trello: We don't create custom actions (Trello tracks automatically)
 * For Mock: posts to json-server
 */
export const logActivity = async ({ message, time }) => {
  if (isTrelloEnabled()) {
    // Trello automatically logs actions - we can't create custom ones
    // Just return success to keep the app working
    console.log("Activity:", message);
    return { id: Date.now().toString(), message, time: time || new Date().toISOString() };
  } else {
    const activity = {
      message,
      time: time || new Date().toISOString()
    };
    const res = await axios.post(MOCK_BASE_URL, activity);
    return res.data;
  }
};

/**
 * Clear all activity logs (Mock only)
 */
export const clearActivity = async () => {
  if (isTrelloEnabled()) {
    // Cannot clear Trello actions
    return;
  }
  
  const activities = await getActivity();
  for (const act of activities) {
    await axios.delete(`${MOCK_BASE_URL}/${act.id}`);
  }
};
