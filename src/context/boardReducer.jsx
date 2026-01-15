const boardReducer = (state, action) => {
  switch (action.type) {
    case "SET_COLUMNS":
      return {
        ...state,
        columns: action.payload
      };

    case "SET_TASKS":
      return {
        ...state,
        tasks: action.payload
      };

    case "SET_ACTIVITY":
      return {
        ...state,
        activity: action.payload
      };

    case "SET_LOADING":
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload }
      };

    case "SET_ERROR":
      return {
        ...state,
        ui: { ...state.ui, error: action.payload }
      };

    case "ADD_TASK":
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      };

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        )
      };

    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };

    case "ADD_COLUMN":
      return {
        ...state,
        columns: [...state.columns, action.payload]
      };

    case "UPDATE_COLUMN":
      return {
        ...state,
        columns: state.columns.map(col =>
          col.id === action.payload.id ? action.payload : col
        )
      };

    case "DELETE_COLUMN":
      return {
        ...state,
        columns: state.columns.filter(
          col => col.id !== action.payload.columnId
        ),
        tasks: state.tasks.filter(
          task => task.columnId !== action.payload.columnId
        )
      };

    case "TOGGLE_TASK":
      return {
        ...state,
        selectedTasks: state.selectedTasks.includes(action.payload)
          ? state.selectedTasks.filter(id => id !== action.payload)
          : [...state.selectedTasks, action.payload]
      };

    case "CLEAR_SELECTED_TASKS":
      return {
        ...state,
        selectedTasks: []
      };

    case "SET_AUTH":
      return {
        ...state,
        auth: action.payload
      };

    default:
      return state;
  }
};

export default boardReducer;
