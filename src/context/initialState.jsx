const initialState = {
  auth: {
    user: {
      name: "Kratik",
      role: "admin"
    },
    isAuthenticated: true
  },

  columns: [],

  tasks: [],

  activity: [],

  selectedTasks: [],

  filters: {
    search: "",
    priority: "",
    assignee: "",
    tags: "",
    sortBy: ""
  },

  ui: {
    loading: false,
    error: null
  }
};

export default initialState;
