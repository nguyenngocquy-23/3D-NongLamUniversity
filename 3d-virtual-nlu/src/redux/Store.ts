import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/AuthSlice.ts";
import dataReducer from "./slices/DataSlice.ts";
import panoramaReducer from "./slices/PanoramaSlice.ts";
import hotspotReducer from "./slices/HotspotSlice.ts";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    data: dataReducer,
    panoramas: panoramaReducer,
    hotspots: hotspotReducer,
  },
});

// Lấy kiểu dữ liệu RootState và AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
