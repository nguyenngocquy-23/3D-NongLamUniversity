import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/AuthSlice.tsx";
import dataReducer from "./slices/DataSlice.tsx";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    data: dataReducer,
  },
});

// Lấy kiểu dữ liệu RootState và AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
