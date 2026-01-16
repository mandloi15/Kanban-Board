// Trello API Configuration
export const TRELLO_CONFIG = {
  apiKey: import.meta.env.VITE_TRELLO_API_KEY || '',
  token: import.meta.env.VITE_TRELLO_TOKEN || '',
  boardId: import.meta.env.VITE_TRELLO_BOARD_ID || '',
  baseUrl: 'https://api.trello.com/1'
};

// Log config on load (remove in production)
console.log("🔧 Trello Config:", {
  apiKey: TRELLO_CONFIG.apiKey ? "✅ Set" : "❌ Missing",
  token: TRELLO_CONFIG.token ? "✅ Set" : "❌ Missing", 
  boardId: TRELLO_CONFIG.boardId ? `✅ ${TRELLO_CONFIG.boardId}` : "❌ Missing"
});

// Check if Trello is enabled
export const isTrelloEnabled = () => {
  return Boolean(TRELLO_CONFIG.apiKey && TRELLO_CONFIG.token && TRELLO_CONFIG.boardId);
};

// Helper to append auth params to URLs
export const withAuth = (url) => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}key=${TRELLO_CONFIG.apiKey}&token=${TRELLO_CONFIG.token}`;
};
