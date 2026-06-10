import { createSlice } from "@reduxjs/toolkit";

interface StateType {
  userLogin: any;
  permission: any;
  messageModal: any;
}
const saved = localStorage.getItem("permission");
const initialState: StateType = {
  // userLogin: {},
  // permission: [],
  messageModal: { show: false, title: "", varient: "warning" },
  permission: saved ? saved.split(",") : [],
  userLogin: JSON.parse(localStorage.getItem("userLogin") || "{}"),
};

const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    RsetUserLogin: (state, { payload }: any) => {
      state.userLogin = payload;
    },
    RsetMessageModal: (state, { payload }: any) => {
      state.messageModal = payload;
    },
    RsetPermission: (state, { payload }: any) => {
      state.permission = payload;
    },
  },
});

export const { RsetUserLogin, RsetPermission, RsetMessageModal } =
  mainSlice.actions;
export default mainSlice.reducer;
