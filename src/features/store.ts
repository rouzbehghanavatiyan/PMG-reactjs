import { configureStore } from "@reduxjs/toolkit";
import mainSlice from "./slices/mainSlice";
import toastReducer from "./slices/toastSloce"
import { useDispatch, useSelector } from "react-redux";

import type { TypedUseSelectorHook } from "react-redux";

export const store = configureStore({
  reducer: {
    main: mainSlice,
     toast: toastReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
