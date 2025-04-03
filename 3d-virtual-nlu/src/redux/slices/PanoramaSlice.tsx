import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RiNumbersFill } from "react-icons/ri";

interface panoramaState {
  panoramaUrl: string | null;
  spaceId: string | null;
}

const initialState: panoramaState = {
  panoramaUrl: null,
  spaceId: null,
};

const panoramaSlice = createSlice({
  name: "panorama",
  initialState,
  reducers: {
    setPanoramaUrl: (state, action: PayloadAction<string>) => {
      state.panoramaUrl = action.payload;
    },
    setSpaceId: (state, action: PayloadAction<string>) => {
      state.spaceId = action.payload;
    },
  },
});

export const { setPanoramaUrl, setSpaceId } = panoramaSlice.actions;
export default panoramaSlice.reducer;
