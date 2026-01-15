import { createContext, useReducer, useEffect } from "react";
import initialState from "./initialState";
import boardReducer from "./boardReducer";
import { getColumns } from "../api/columns";
import { getTasks } from "../api/tasks";
import { getActivity } from "../api/activity";

export const BoardContext = createContext();

export const BoardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(boardReducer, initialState);

  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const [columns, tasks, activity] = await Promise.all([
          getColumns(),
          getTasks(),
          getActivity()
        ]);

        dispatch({ type: "SET_COLUMNS", payload: columns });
        dispatch({ type: "SET_TASKS", payload: tasks });
        dispatch({ type: "SET_ACTIVITY", payload: activity });
      } catch (err) {
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
