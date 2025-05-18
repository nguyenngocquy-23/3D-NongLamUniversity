import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/AuthSlice.ts";
import dataReducer from "./slices/DataSlice.ts";
import panoramaReducer from "./slices/PanoramaSlice.ts";
import hotspotReducer from "./slices/HotspotSlice.ts";
import stepReducer from "./slices/StepSlice.ts";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    data: dataReducer,
    hotspots: hotspotReducer,
    panoramas: panoramaReducer,
    step: stepReducer,
  },
});

// Lấy kiểu dữ liệu RootState và AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
