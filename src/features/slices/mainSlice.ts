import { createSlice } from "@reduxjs/toolkit";

interface StateType {
  permission: any;
  messageModal: any;
  fetchNewsList: any;
  userProfile: any;
  poll: any;
  notifMessage: any;
  isShowBirthday: boolean;
}
const saved = localStorage.getItem("permission");
const initialState: StateType = {
  poll: [],
  fetchNewsList: [],
  messageModal: { show: false, title: "", varient: "warning" },
  permission: saved ? saved.split(",") : [],
  userProfile: {},
  isShowBirthday: false,
  notifMessage: {},
};

const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    RsetUserProfile: (state, { payload }: any) => {
      state.userProfile = payload;
    },
    RsetNotifMessage: (state, { payload }: any) => {
      state.notifMessage = payload;
    },
    RsetMessageModal: (state, { payload }: any) => {
      state.messageModal = payload;
    },
    RsetPermission: (state, { payload }: any) => {
      state.permission = payload;
    },
    RsetIsShowBirthday: (state, { payload }: any) => {
      state.isShowBirthday = payload;
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
  RsetUserProfile,
  RsetPermission,
  RsetMessageModal,
  RsetIsShowBirthday,
  RsetNotifMessage,
} = mainSlice.actions;
export default mainSlice.reducer;
