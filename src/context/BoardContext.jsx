import { createContext, useReducer, useEffect } from "react";
import initialState from "./initialState";
import boardReducer from "./boardReducer";
import { getColumns } from "../api/columns-trello";
import { getTasks } from "../api/tasks-trello";
import { getActivity } from "../api/activity-trello";

export const BoardContext = createContext();

export const BoardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        console.log("🔄 Loading board data...");
        
        const columns = await getColumns();
        console.log("✅ Columns loaded:", columns);
        
        const tasks = await getTasks();
        console.log("✅ Tasks loaded:", tasks);
        
        const activity = await getActivity();
        console.log("✅ Activity loaded:", activity);

        dispatch({ type: "SET_COLUMNS", payload: columns });
        dispatch({ type: "SET_TASKS", payload: tasks });
        dispatch({ type: "SET_ACTIVITY", payload: activity });
        
        console.log("✅ Board loaded successfully!");
      } catch (err) {
        console.error("❌ Error loading board:", err);
        dispatch({
          type: "SET_ERROR",
          payload: "Failed to load board data"
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadData();
  }, []);

  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
};
