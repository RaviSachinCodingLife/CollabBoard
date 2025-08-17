import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import boardReducer from "../features/boardSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    board: boardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
