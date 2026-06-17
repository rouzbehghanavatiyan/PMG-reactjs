import { createSlice } from "@reduxjs/toolkit";

interface StateType {
  userLogin: any;
  permission: any;
  messageModal: any;
  fetchNewsList: any;
  poll: any;
}
const saved = localStorage.getItem("permission");
const initialState: StateType = {
  poll: [],
  fetchNewsList: [],
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
    RsetPoll: (state, { payload }: any) => {
      state.poll = payload;
    },

    RsetFetchNewsList: (state, { payload }: any) => {
      state.fetchNewsList = payload;
    },
  },
});

export const {
  RsetFetchNewsList,
  RsetPoll,
  RsetUserLogin,
  RsetPermission,
  RsetMessageModal,
} = mainSlice.actions;
export default mainSlice.reducer;
