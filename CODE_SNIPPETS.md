# 🔍 CODE SNIPPETS - ADD TASK FLOW

## 1️⃣ USER CLICKS "ADD TASK" - Column.jsx (Line 159)

```jsx
<div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
  <button
    onClick={() => setTaskOpen(true)}
    disabled={isLoading}
    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
               text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg 
               transition-all duration-200 text-sm font-semibold group 
               disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isLoading ? (
      <>
        <span className="animate-spin">⏳</span> Saving...
      </>
    ) : (
      <>
        <span className="text-lg group-hover:scale-125 transition-transform">+</span> 
        Add Task
      </>
    )}
  </button>
</div>
```

**What happens:**
- `setTaskOpen(true)` triggers modal render
- Button shows loading spinner if `isLoading` is true
- Button is disabled during save operation

---

## 2️⃣ MODAL OPENS - TaskModal.jsx (Appears)

```jsx
function TaskModal({ onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    assignee: "",
    tags: []
  });

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // ... form code
}
```

**State Tracking:**
- `formData` - user input
- `errors` - validation errors
- `isLoading` - during submission
- `submitError` - API errors

---

## 3️⃣ VALIDATION - TaskModal.jsx (Lines 28-87)

```javascript
/**
 * Validate individual form fields
 * Returns error message if invalid, empty string if valid
 */
const validateField = (name, value) => {
  switch (name) {
    case "title":
      if (!value || !value.trim()) return "Task title is required";
      if (value.trim().length < 3) return "Title must be at least 3 characters";
      if (value.trim().length > 100) return "Title cannot exceed 100 characters";
      return "";

    case "description":
      if (value && value.length > 500) return "Description cannot exceed 500 characters";
      return "";

    case "dueDate":
      if (value && new Date(value) < new Date(new Date().toDateString())) {
        return "Due date cannot be in the past";
      }
      return "";

    case "assignee":
      if (value && value.trim().length > 50) return "Assignee name too long";
      return "";

    default:
      return "";
  }
};

/**
 * Validate entire form before submission
 */
const validateForm = () => {
  const newErrors = {};

  // Validate title (required)
  const titleError = validateField("title", formData.title);
  if (titleError) newErrors.title = titleError;

  // Validate description
  const descError = validateField("description", formData.description);
  if (descError) newErrors.description = descError;

  // Validate due date
  const dateError = validateField("dueDate", formData.dueDate);
  if (dateError) newErrors.dueDate = dateError;

  // Validate assignee
  const assigneeError = validateField("assignee", formData.assignee);
  if (assigneeError) newErrors.assignee = assigneeError;

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

**Validation Checks:**
- ✓ Title: required, 3-100 chars
- ✓ Description: max 500 chars
- ✓ Due Date: cannot be past
- ✓ Assignee: max 50 chars
- ✓ Tags: max 5

---

## 4️⃣ FORM SUBMISSION - TaskModal.jsx (Lines 114-130)

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitError("");

  // Step 1: Validate form
  if (!validateForm()) {
    setSubmitError("Please fix the errors above and try again");
    return;
  }

  try {
    // Step 2: Set loading state
    setIsLoading(true);

    // Step 3: Call parent's onSubmit which handles API call
    await onSubmit(formData);

    // Step 4: Success - modal will close via parent
    // Task will be added to state and UI will re-render
  } catch (error) {
    // Handle API errors
    setSubmitError(
      error.message || "Failed to save task. Please try again."
    );
    setIsLoading(false);
  }
};
```

**Flow:**
1. Prevent default form behavior
2. Validate all fields
3. Set loading state (disable inputs)
4. Call parent's onSubmit (from Column.jsx)
5. Catch any API errors

---

## 5️⃣ API CALL - Column.jsx (Lines 39-81)

```javascript
/**
 * ⭐ FULL ADD TASK FLOW (INTERVIEW READY)
 */
const handleAddTask = async (formData) => {
  setError(null);
  setIsLoading(true);

  try {
    console.log("📤 Step 1: User submitted form data:", formData);

    // Step 2: Prepare complete task payload for backend
    const taskPayload = {
      title: formData.title,
      description: formData.description || "",
      priority: formData.priority,
      dueDate: formData.dueDate || null,
      assignee: formData.assignee || "",
      tags: formData.tags || [],
      columnId: column.id,
      order: Date.now(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log("📋 Step 2: Prepared payload:", taskPayload);

    // Step 3: POST request to backend
    console.log(`📤 Step 3: Sending POST /tasks request...`);
    const createdTask = await addTask(taskPayload);
    console.log("📥 Step 4: Backend response (task created):", createdTask);

    // Step 5: Update global state
    console.log("🔄 Step 5: Dispatching ADD_TASK to update global state");
    dispatch({ type: "ADD_TASK", payload: createdTask });

    // Step 6: Log activity
    console.log("📝 Step 6: Logging activity");
    await logActivity({
      message: `Task "${createdTask.title}" added to ${column.title}`,
      time: new Date().toISOString()
    });

    console.log("✅ Step 7: Success! UI will re-render with new task");
    console.log("💾 Step 8: On page refresh, task persists via json-server");

    setTaskOpen(false);
  } catch (err) {
    console.error("❌ Error in add task flow:", err);
    setError(
      err.message || "Failed to create task. Please check your input and try again."
    );
  } finally {
    setIsLoading(false);
  }
};
```

**Key Points:**
- Prepare payload with all fields
- POST to API
- Dispatch to global state
- Log activity
- Handle errors with try-catch
- Close modal on success

---

## 6️⃣ API LAYER - tasks.js (Lines 20-23)

```javascript
/**
 * ADD TASK
 * Used in Column.jsx handleAddTask
 */
export const addTask = async (task) => {
  const res = await axios.post(BASE_URL, task);
  return res.data;
};
```

**HTTP Request:**
```
POST http://localhost:5000/tasks
Content-Type: application/json

{
  "title": "Complete project proposal",
  "description": "Finish Q1 proposal",
  "priority": "high",
  "dueDate": "2026-02-15",
  "assignee": "Alice",
  "tags": ["urgent", "proposal"],
  "columnId": "col-1",
  "order": 1705330545000,
  "completed": false,
  "createdAt": "2026-01-15T10:15:45.000Z",
  "updatedAt": "2026-01-15T10:15:45.000Z"
}
```

**Response:**
```json
{
  "id": 3,
  "title": "Complete project proposal",
  "description": "Finish Q1 proposal",
  "priority": "high",
  "dueDate": "2026-02-15",
  "assignee": "Alice",
  "tags": ["urgent", "proposal"],
  "columnId": "col-1",
  "order": 1705330545000,
  "completed": false,
  "createdAt": "2026-01-15T10:15:45.000Z",
  "updatedAt": "2026-01-15T10:15:45.000Z"
}
```

---

## 7️⃣ STATE UPDATE - boardReducer.jsx

```javascript
case "ADD_TASK":
  return {
    ...state,
    tasks: [...state.tasks, action.payload]  // ← Add task to array
  };
```

**Before:**
```javascript
tasks: [
  { id: 1, title: "Design", ... },
  { id: 2, title: "Review", ... }
]
```

**After:**
```javascript
tasks: [
  { id: 1, title: "Design", ... },
  { id: 2, title: "Review", ... },
  { id: 3, title: "Complete project proposal", ... }  ← NEW
]
```

---

## 8️⃣ RE-RENDER - Component Updates

```javascript
// TaskList.jsx - includes new task in render
const columnTasks = tasks.filter(t => t.columnId === column.id);
// Now includes the newly created task

// Column.jsx - task count updates
<span className="flex-shrink-0 px-2.5 py-1 bg-blue-100 text-blue-700...">
  {columnTasks.length}  {/* 5 → 6 */}
</span>

// ActivityLog.jsx - shows new activity
const sortedActivity = state.activity.sort(...);
// Includes "Task 'Complete project proposal' added to In Progress"
```

---

## 9️⃣ PERSISTENCE - db.json Auto-Update

```bash
# JSON Server watches db.json
# When POST /tasks request received:
# 1. Generates unique ID
# 2. Writes to db.json
# 3. Returns response

# Before:
"tasks": [
  { "id": 1, ... },
  { "id": 2, ... }
]

# After (auto-saved):
"tasks": [
  { "id": 1, ... },
  { "id": 2, ... },
  { "id": 3, "title": "Complete project proposal", ... }
]
```

---

## ERROR HANDLING

### Frontend Validation Error:
```jsx
{errors.title && (
  <p className="text-sm text-red-600 mt-1">
    ℹ️ {errors.title}
  </p>
)}
```

### API Error:
```jsx
{submitError && (
  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
    <p className="text-sm font-semibold text-red-700">
      ⚠️ {submitError}
    </p>
  </div>
)}
```

### Try-Catch Pattern:
```javascript
try {
  const createdTask = await addTask(taskPayload);
  dispatch({ type: "ADD_TASK", payload: createdTask });
  setTaskOpen(false);
} catch (err) {
  setError(err.message || "Failed to create task...");
  setIsLoading(false);  // Keep modal open for retry
}
```

---

## LOADING STATE MANAGEMENT

```jsx
// During submission
{isLoading && (
  <>
    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
    Saving...
  </>
)}

// Disabled inputs during load
<input
  disabled={isLoading}
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
/>

// Form cannot be re-submitted
<button type="submit" disabled={isLoading}>
  Create Task
</button>
```

---

## CONSOLE LOGGING (For Debugging)

```javascript
console.log("📤 Step 1: User submitted form data:", formData);
console.log("📋 Step 2: Prepared payload:", taskPayload);
console.log(`📤 Step 3: Sending POST /tasks request...`);
console.log("📥 Step 4: Backend response (task created):", createdTask);
console.log("🔄 Step 5: Dispatching ADD_TASK to update global state");
console.log("📝 Step 6: Logging activity");
console.log("✅ Step 7: Success! UI will re-render with new task");
console.log("💾 Step 8: On page refresh, task persists via json-server");

// On error:
console.error("❌ Error in add task flow:", err);
```

Open DevTools Console (F12) to see complete flow execution.

---

## COMPLETE TASK PAYLOAD STRUCTURE

```javascript
{
  // Display fields
  "title": "Complete project proposal",         // required
  "description": "Finish Q1 proposal",          // optional
  "priority": "high",                           // low|medium|high
  "dueDate": "2026-02-15",                      // optional
  "assignee": "Alice",                          // optional
  "tags": ["urgent", "proposal"],               // array

  // System fields
  "columnId": "col-1",                          // which column
  "order": 1705330545000,                       // sort order
  "completed": false,                           // default false
  "createdAt": "2026-01-15T10:15:45.000Z",    // timestamp
  "updatedAt": "2026-01-15T10:15:45.000Z",    // timestamp

  // Auto-generated by server
  "id": 3                                       // unique ID
}
```

---

## KEY TAKEAWAYS FOR INTERVIEW

1. **Form Validation** → Real-time feedback, comprehensive checks
2. **API Integration** → Clean axios usage, proper error handling
3. **State Management** → Context API + useReducer pattern
4. **Loading States** → UX feedback during async operations
5. **Persistence** → JSON Server auto-saves and watches
6. **Error Handling** → Try-catch + user-friendly messages
7. **Code Organization** → Separation of concerns (UI/API/State)
8. **Debugging** → Console logs at each step for visibility

