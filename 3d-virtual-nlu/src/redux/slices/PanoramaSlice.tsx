import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface PanoramaConfig {
  
}


interface panoramaState {
  panoramaUrls: string[];
  spaceId: string | null;
}

const initialState: panoramaState = {
  panoramaUrls: [],
  spaceId: null,
};

const panoramaSlice = createSlice({
  name: "panorama",
  initialState,
  reducers: {
    addPanoramaUrl: (state, action: PayloadAction<string>) => {
      state.panoramaUrls.push(action.payload);
    },
    removePanoramaUrl: (state, action: PayloadAction<number>) => {
      state.panoramaUrls.splice(action.payload, 1); //xoá ảnh theo index.
    },
    clearPanoramaUrls: (state) => {
      state.panoramaUrls = [];
    },
    setSpaceId: (state, action: PayloadAction<string>) => {
      state.spaceId = action.payload;
    },
  },
});

export const {
  addPanoramaUrl,
  removePanoramaUrl,
  clearPanoramaUrls,
  setSpaceId,
} = panoramaSlice.actions;
export default panoramaSlice.reducer;
