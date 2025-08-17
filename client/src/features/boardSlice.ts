import { createSlice } from "@reduxjs/toolkit";

const boardSlice = createSlice({
  name: "board",
  initialState: {
    boards: [],
    activeBoard: null,
  },
  reducers: {
    setBoards: (state, action) => {
      state.boards = action.payload;
    },
    setActiveBoard: (state, action) => {
      state.activeBoard = action.payload;
    },
  },
});

export const { setBoards, setActiveBoard } = boardSlice.actions;
export default boardSlice.reducer;
