# 🔗 Trello API Integration Guide

## Setup Instructions

### 1. Get Your Trello Credentials

1. **Get API Key:**
   - Go to: https://trello.com/app-key
   - Copy your API Key

2. **Generate Token:**
   - On the same page, click the "Token" link
   - Authorize the app
   - Copy your Token

3. **Get Board ID:**
   - Open your Trello board
   - Add `.json` to the URL: `https://trello.com/b/BOARD_ID.json`
   - Copy the `id` from the JSON response

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
VITE_TRELLO_API_KEY=your_api_key_here
VITE_TRELLO_TOKEN=your_token_here
VITE_TRELLO_BOARD_ID=your_board_id_here
```

### 3. Update API Imports

Replace the current API imports with Trello versions:

**In src/context/BoardContext.jsx:**
```javascript
import { getColumns } from "../api/columns-trello";
import { getTasks } from "../api/tasks-trello";
```

**In src/components/Column.jsx:**
```javascript
import { addTask } from "../api/tasks-trello";
import { updateColumn, deleteColumn } from "../api/columns-trello";
```

**Note:** The Trello API will automatically activate when environment variables are set. Without them, it falls back to mock API.

### 4. Restart Development Server

```bash
npm run dev
```

## API Mapping

| Your App | Trello API | Endpoint |
|----------|-----------|----------|
| Columns | Lists | /boards/{id}/lists |
| Tasks | Cards | /boards/{id}/cards |
| Activity | Actions | /boards/{id}/actions |

## Trello Data Structure

**Card (Task) Structure:**
```javascript
{
  id: "card_id",
  name: "Task title",
  desc: "Description",
  idList: "list_id",  // Column ID
  due: "2026-01-20",
  pos: 65535,         // Order position
  labels: [],         // For priority/tags
  members: [],        // For assignees
}
```

**List (Column) Structure:**
```javascript
{
  id: "list_id",
  name: "Column name",
  idBoard: "board_id",
  pos: 16384
}
```

## Important Notes

1. **List IDs:** When creating tasks, use Trello List IDs (not numbers)
2. **Labels:** Priority should be set via labels in Trello
3. **Members:** Assignees require member IDs from your board
4. **Rate Limits:** Trello has rate limits (300 requests per 10 seconds)
5. **Delete:** Trello archives cards/lists instead of deleting

## Testing

Test your connection:
```bash
curl "https://api.trello.com/1/boards/YOUR_BOARD_ID?key=YOUR_KEY&token=YOUR_TOKEN"
```

## Troubleshooting

- **401 Unauthorized:** Check your API key and token
- **404 Not Found:** Verify your board ID
- **CORS Errors:** Use proper Trello authentication

For more info: https://developer.atlassian.com/cloud/trello/rest/
