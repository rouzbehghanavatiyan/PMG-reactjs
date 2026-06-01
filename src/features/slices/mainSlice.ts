import { createSlice } from "@reduxjs/toolkit";

interface StateType {
  userLogin: any;
}

const initialState: StateType = {
  userLogin: {},
};

const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    RsetUserLogin: (state, { payload }: any) => {
      state.userLogin = payload;
    },
  },
});

export const { RsetUserLogin } = mainSlice.actions;
export default mainSlice.reducer;
