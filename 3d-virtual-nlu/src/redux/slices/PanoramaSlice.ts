import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PanoramaConfig {
  /**
   * + id tự tăng khi đẩy vào database.
   * + createdAt, updatedAt: default theo db
   * + status: phân biệt node chủ - node con.
   */
  name: string;
  description: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  autoRotate: number;
  speedRotate: number;
  lightIntensity: number;
  status: number;
}

export interface PanoramaItem {
  id?: number;
  spaceId: string;
  url: string;
  config: PanoramaConfig;
}

interface PanoramaState {
  panoramaList: PanoramaItem[];
  currentSelectedPosition: number;
  spaceId: string | null;
}

const initialState: PanoramaState = {
  panoramaList: [],
  currentSelectedPosition: 0,
  spaceId: null,
};

const panoramaSlice = createSlice({
  name: "panoramas",
  initialState,
  reducers: {
    setSpaceId(state, action: PayloadAction<string>) {
      state.spaceId = action.payload;
    },
    // Upload panorama lần đầu tiên
    setPanoramas(
      state,
      action: PayloadAction<Array<{ originalFileName: string; url: string }>>
    ) {
      state.panoramaList = action.payload.map((item, index) => ({
        url: item.url,
        spaceId: state.spaceId!,
        config: {
          name: item.originalFileName,
          description: "",
          positionX: 0,
          positionY: 0,
          positionZ: 0,
          autoRotate: 0,
          speedRotate: 0,
          lightIntensity: 1,
          status: index === 0 ? 1 : 2,
        },
      }));
      state.currentSelectedPosition = 0;
    },

    addPanorama(state, action: PayloadAction<string>) {
      if (state.panoramaList.length < 5 && state.spaceId !== null) {
        state.panoramaList.push({
          url: action.payload,
          spaceId: state.spaceId,
          config: {
            name: "",
            description: "",
            positionX: 0,
            positionY: 0,
            positionZ: 0,
            autoRotate: 0,
            speedRotate: 0,
            lightIntensity: 1,
            status: 2,
          },
        });
      }
    },
    selectPanorama(state, action: PayloadAction<number>) {
      state.currentSelectedPosition = action.payload;
    },
    setMasterPanorama(state, action: PayloadAction<number>) {
      const masterIndex = action.payload;
      state.panoramaList.forEach((item, index) => {
        item.config.status = index === masterIndex ? 1 : 2;
      });
    },
    updatePanoConfig(
      state,
      action: PayloadAction<{ index: number; config: Partial<PanoramaConfig> }>
    ) {
      const { index, config } = action.payload;
      if (state.panoramaList[index]) {
        state.panoramaList[index].config = {
          ...state.panoramaList[index].config,
          ...config,
        };
      }
    },
    clearPanorama(state) {
      (state.panoramaList = []),
        (state.currentSelectedPosition = 0),
        (state.spaceId = null);
    },
  },
});

export const {
  setSpaceId,
  setPanoramas,
  addPanorama,
  selectPanorama,
  setMasterPanorama,
  updatePanoConfig,
  clearPanorama,
} = panoramaSlice.actions;
export default panoramaSlice.reducer;
