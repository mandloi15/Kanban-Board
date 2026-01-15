# 🧪 TESTING SCENARIOS - ADD TASK FLOW

## TEST CASE 1: Happy Path (Complete Success)

### Scenario: User creates a valid task and sees it appear

**Steps:**
1. Open http://localhost:5173
2. Click "Add Task" button in any column
3. Fill form:
   - Title: "Complete project proposal"
   - Description: "Finish Q1 proposal document"
   - Priority: Select "High"
   - Due Date: Select future date (e.g., Feb 20, 2026)
   - Assignee: "Alice"
   - Tags: Add "urgent" and "proposal"
4. Click "Create Task" button
5. Observe and verify:

**Expected Behavior:**
```
✓ Modal shows loading spinner ("Saving...")
✓ Form inputs are disabled (opacity: 0.5)
✓ Create Task button shows spinner and "Saving..."
✓ Close button is disabled

After ~500ms-1 second:
✓ Modal closes automatically
✓ New task appears in column
✓ Task count badge updates (5 → 6)
✓ Task displays all fields:
  - Title: "Complete project proposal"
  - Priority: Red dot + "High"
  - Due date: "Feb 20"
  - Assignee: "👤 Alice"
  - Tags: #urgent #proposal
✓ Activity log sidebar shows:
  "Added task 'Complete project proposal' to In Progress"
```

**Verification:**
```javascript
// Open DevTools Console (F12)
// You should see:
📤 Step 1: User submitted form data: {...}
📋 Step 2: Prepared payload: {...}
📤 Step 3: Sending POST /tasks request...
📥 Step 4: Backend response (task created): {...id: 3, ...}
🔄 Step 5: Dispatching ADD_TASK to update global state
📝 Step 6: Logging activity
✅ Step 7: Success! UI will re-render with new task
💾 Step 8: On page refresh, task persists via json-server
```

**Persistence Test:**
```
1. Note the new task in the column
2. Press F5 (refresh page)
3. Wait for data to load
4. Verify: Task is still there
   ✓ Same title
   ✓ Same priority color
   ✓ Same assignee
   ✓ Same tags
```

---

## TEST CASE 2: Validation - Empty Title

### Scenario: User tries to submit without title

**Steps:**
1. Click "Add Task"
2. Leave title empty
3. Describe: "Some description"
4. Try to click "Create Task"

**Expected Behavior:**
```
✓ Submit button is DISABLED (cannot click)
✓ Title field has RED BORDER
✓ Error message appears: "Task title is required"
✓ Modal stays open
```

**Code Path:**
```javascript
// TaskModal.jsx validateField("title", "")
→ Returns: "Task title is required"
→ Sets errors.title
→ Submit button checks: Object.keys(newErrors).length === 0
→ Returns false → cannot submit
```

---

## TEST CASE 3: Validation - Title Too Short

### Scenario: User enters title with only 2 characters

**Steps:**
1. Click "Add Task"
2. Title: "ab" (only 2 chars)
3. Try to submit

**Expected Behavior:**
```
✓ Title field has RED BORDER
✓ Error message: "Title must be at least 3 characters"
✓ Submit button is DISABLED
✓ Character counter shows: "2/100"
✓ Error clears when user types "abc"
✓ Submit button becomes ENABLED
```

**Validation Rule:**
```javascript
if (value.trim().length < 3) 
  return "Title must be at least 3 characters";
```

---

## TEST CASE 4: Validation - Title Too Long

### Scenario: User enters title exceeding 100 characters

**Steps:**
1. Click "Add Task"
2. Title: Copy/paste 150-character string
3. Try to submit

**Expected Behavior:**
```
✓ Title field has RED BORDER
✓ Error: "Title cannot exceed 100 characters"
✓ Character counter: "150/100" (red text)
✓ Submit button is DISABLED
✓ Trim text to 100 chars
✓ Error clears
✓ Submit button enables
```

---

## TEST CASE 5: Validation - Past Due Date

### Scenario: User selects a past date

**Steps:**
1. Click "Add Task"
2. Fill title: "Test task"
3. Due Date: Select January 10, 2026 (past date)
4. Try to submit

**Expected Behavior:**
```
✓ Due Date field has RED BORDER
✓ Error: "Due date cannot be in the past"
✓ Submit button is DISABLED
✓ Modal stays open
✓ Select future date
✓ Error clears
✓ Submit button enables
```

**Validation:**
```javascript
if (value && new Date(value) < new Date(new Date().toDateString())) {
  return "Due date cannot be in the past";
}
```

---

## TEST CASE 6: Validation - Too Many Tags

### Scenario: User tries to add more than 5 tags

**Steps:**
1. Click "Add Task"
2. Fill title: "Test task"
3. Add tags: "tag1", "tag2", "tag3", "tag4", "tag5"
4. Try to add 6th tag "tag6"

**Expected Behavior:**
```
✓ First 5 tags added successfully
✓ Error: "Maximum 5 tags allowed"
✓ "Add" button becomes DISABLED
✓ Tag input field disabled
✓ Cannot add 6th tag
✓ Remove one tag (5 → 4)
✓ Tag input re-enabled
✓ Can add tag again
```

---

## TEST CASE 7: Validation - Description Too Long

### Scenario: User enters description exceeding 500 characters

**Steps:**
1. Click "Add Task"
2. Description: Paste 600+ character text
3. Try to submit

**Expected Behavior:**
```
✓ Description field has RED BORDER
✓ Error: "Description cannot exceed 500 characters"
✓ Character counter: "600/500" (red text)
✓ Submit button is DISABLED
✓ Trim description
✓ Error clears
✓ Submit button enables
```

---

## TEST CASE 8: API Error - Network Offline

### Scenario: JSON Server is stopped when user submits

**Steps:**
1. Stop JSON Server:
   ```bash
   # Find terminal running "npm run server"
   # Press Ctrl+C
   ```
2. Click "Add Task"
3. Fill valid form
4. Click "Create Task"
5. Wait 1-2 seconds

**Expected Behavior:**
```
✓ Loading spinner shows briefly
✓ After timeout, error appears:
  "Failed to create task. Please check your input and try again."
✓ Error shown in RED box in modal
✓ "Dismiss" button appears
✓ Modal stays open (not closed)
✓ Can dismiss error and retry
```

**Then:**
```bash
# Restart JSON Server
npm run server
# Try adding task again - should succeed
```

---

## TEST CASE 9: API Error - Invalid Server Response

### Scenario: Server responds with error

**Steps:**
1. Click "Add Task"
2. Fill form
3. (Simulate error by modifying API URL temporarily)
4. Submit

**Expected Behavior:**
```
✓ Error caught by try-catch
✓ Error message displayed
✓ Modal stays open for retry
✓ Loading state cleared
✓ isLoading = false
✓ User can click "Dismiss" and retry
```

---

## TEST CASE 10: Real-Time Validation Feedback

### Scenario: User types and sees validation in real-time

**Steps:**
1. Click "Add Task"
2. Leave title empty
   - ✓ Error shows: "Task title is required"
3. Type "ab"
   - ✓ Error shows: "Title must be at least 3 characters"
   - ✓ Character counter: "2/100"
4. Type "abc"
   - ✓ Error clears automatically
   - ✓ No error message
   - ✓ Character counter: "3/100"
5. Continue typing "abcdef"
   - ✓ No errors
   - ✓ Character counter: "6/100"

**Code:**
```javascript
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));

  // Clear error as user types
  if (errors[name]) {
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error || undefined
    }));
  }
};
```

---

## TEST CASE 11: Loading State - Cannot Double Submit

### Scenario: User clicks "Create Task" twice rapidly

**Steps:**
1. Click "Add Task"
2. Fill form with valid data
3. Click "Create Task"
4. Immediately click "Create Task" again (before modal closes)

**Expected Behavior:**
```
✓ First click: Request sent, loading = true
✓ Second click: Button disabled, no second request sent
✓ After response: Only one task created (not duplicated)
✓ Modal closes normally
```

**Verification in Network Tab:**
```
Open DevTools → Network tab
POST /tasks → 201 Created (only ONE request)
```

---

## TEST CASE 12: Modal Close Without Submission

### Scenario: User opens modal and closes without saving

**Steps:**
1. Click "Add Task"
2. Fill form with data
3. Click "Cancel" button
4. Click "Add Task" again

**Expected Behavior:**
```
✓ Modal closes
✓ Form data is cleared (fresh state)
✓ No request sent to backend
✓ Reopened modal shows empty form
✓ No task created
✓ No activity logged
```

---

## TEST CASE 13: Task Appears in Correct Column

### Scenario: User creates task in "In Progress" column

**Steps:**
1. Click "Add Task" in "In Progress" column
2. Fill form
3. Create task

**Expected Behavior:**
```
✓ Task appears in "In Progress" column (NOT other columns)
✓ Task count for "In Progress" updates
✓ Task count for other columns unchanged
✓ Activity log shows: "added to In Progress"
```

**Verification:**
```javascript
// In state
columnId: "in-progress"

// In UI
Column name: "In Progress"
tasksList includes new task
```

---

## TEST CASE 14: All Fields Preserved

### Scenario: Create task with all fields filled

**Steps:**
1. Create task with:
   - Title: "Test task"
   - Description: "Test description"
   - Priority: "High"
   - Due Date: "Feb 20, 2026"
   - Assignee: "Alice"
   - Tags: ["tag1", "tag2"]
2. Verify all fields display correctly

**Expected Display:**
```
Card shows:
✓ Title: "Test task"
✓ Priority: Red dot + "High" badge
✓ Due date: "Feb 20" in red text
✓ Assignee: "👤 Alice"
✓ Tags: "#tag1 #tag2"
```

---

## TEST CASE 15: Refresh Page - Persistence

### Scenario: Create task then refresh

**Steps:**
1. Create task: "Persistent task"
2. Verify task appears
3. Press F5 or Ctrl+Shift+R (hard refresh)
4. Wait for app to load

**Expected Behavior:**
```
✓ Data loading spinner shows
✓ After 1-2 seconds, app loads
✓ Task still visible in same column
✓ All fields preserved:
  - Title: "Persistent task"
  - Priority color
  - Assignee
  - Tags
✓ Task count same as before
```

**Verification:**
```bash
# Check db.json directly
cat db.json
# Verify task exists in tasks array with same data
```

---

## TEST CASE 16: Activity Log Updated

### Scenario: Create task and check activity log

**Steps:**
1. Create task: "Activity test task"
2. Look at Activity Log sidebar
3. Scroll to top of activity list

**Expected Behavior:**
```
✓ Top activity shows:
  "Added task 'Activity test task' to [Column Name]"
✓ Timestamp shows: "just now" or "< 1m ago"
✓ Icon: "➕" (add icon)
✓ Activity appears in Activity.json
```

---

## TEST CASE 17: Character Counter Accuracy

### Scenario: Verify character counters

**Steps:**
1. Click "Add Task"
2. Type title: "1234567890"
3. Check character counter

**Expected Display:**
```
Below title input: "10/100"
```

**For Description:**
1. Type description: "Hello world!"
2. Counter: "12/500"

---

## TEST CASE 18: Form Remains Open on Error

### Scenario: Error occurs during submission

**Steps:**
1. Stop JSON Server
2. Create task with valid data
3. Click "Create Task"
4. Wait for error

**Expected Behavior:**
```
✓ Error message shows
✓ Modal stays open (NOT closed)
✓ Form data preserved (user can fix)
✓ User can click "Dismiss"
✓ User can restart server and retry
✓ Task created successfully on retry
```

---

## PERFORMANCE TEST

### Scenario: Create 10 tasks rapidly

**Steps:**
1. Create 10 tasks in succession
2. Monitor UI responsiveness
3. Check db.json

**Expected Behavior:**
```
✓ No lag or stutter
✓ Each task creates successfully
✓ UI updates smoothly
✓ All 10 tasks appear in column
✓ No tasks duplicated
✓ All in db.json
```

---

## CONSOLE LOG VERIFICATION

**To verify complete flow with console logs:**

```javascript
// Open DevTools: F12 → Console tab

// Create a task and observe:
1. 📤 Step 1: User submitted form data
2. 📋 Step 2: Prepared payload
3. 📤 Step 3: Sending POST /tasks request
4. 📥 Step 4: Backend response (task created)
5. 🔄 Step 5: Dispatching ADD_TASK to update global state
6. 📝 Step 6: Logging activity
7. ✅ Step 7: Success! UI will re-render with new task
8. 💾 Step 8: On page refresh, task persists via json-server

// All 8 steps should appear in order
// Indicates complete flow execution
```

---

## NETWORK TAB VERIFICATION

**To verify API calls:**

```
Open DevTools: F12 → Network tab

1. Create a task
2. Look for new request:
   - Method: POST
   - URL: http://localhost:5000/tasks
   - Status: 201 Created
   - Response: { id: N, title: "...", ... }

3. On page refresh:
   - Method: GET
   - URL: http://localhost:5000/tasks
   - Status: 200 OK
   - Response: Array of all tasks (including new one)
```

---

## FINAL VERIFICATION CHECKLIST

- [ ] Task creates successfully with valid form
- [ ] Validation errors show for invalid input
- [ ] Real-time validation as user types
- [ ] Loading spinner shows during save
- [ ] Modal closes on success
- [ ] New task appears in correct column
- [ ] Task count updates
- [ ] Activity log shows new entry
- [ ] Character counters work correctly
- [ ] All fields preserved (title, description, priority, etc.)
- [ ] Task persists on page refresh
- [ ] API error handled gracefully
- [ ] Modal stays open on error for retry
- [ ] Console logs show complete flow
- [ ] Network tab shows POST 201 request
- [ ] Cannot double-submit
- [ ] Close button works
- [ ] Dismiss error button works

**All tests passing? You're ready for deployment! ✅**

