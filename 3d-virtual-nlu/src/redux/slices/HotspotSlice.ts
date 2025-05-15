import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";

//Test trước, sau đó dùng API để lấy.
export type HotspotType = 1 | 2 | 3 | 4;

export interface BaseHotspot {
  id: string;
  nodeId: string;
  iconId: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  type: number;
  scale: number;
  pitchX: number;
  yawY: number;
  rollZ: number;
  color: string;
  backgroundColor: string;
  allowBackgroundColor: boolean;
  opacity: number;
}

export interface HotspotNavigation extends BaseHotspot {
  // type: 1;
  targetNodeId: string;
}
export interface HotspotInformation extends BaseHotspot {
  // type: 2;
  title: string;
  content: string;
}
export interface HotspotMedia extends BaseHotspot {
  // type: 3;
  mediaType: string; //image or video
  mediaUrl: string;
  caption: string;
  cornerPointListJson: string;
}
export interface HotspotModel extends BaseHotspot {
  // type: 4;
  modelUrl: string;
  name: string;
  description: string;
  autoRotate: number; //0 = false, 1= true.
  colorCode: string;
}

export type HotspotItem =
  | HotspotNavigation
  | HotspotInformation
  | HotspotMedia
  | HotspotModel;

interface HotspotState {
  hotspotList: HotspotItem[];
}

const initialState: HotspotState = {
  hotspotList: [],
};

const hotspotSlice = createSlice({
  name: "hotspots",
  initialState,
  reducers: {
    addNavigationHotspot: (
      state,
      action: PayloadAction<Omit<HotspotNavigation, "id">>
    ) => {
      state.hotspotList.push({
        ...action.payload,
        id: nanoid(),
      });
    },
    addInformationHotspot: (
      state,
      action: PayloadAction<Omit<HotspotInformation, "id">>
    ) => {
      state.hotspotList.push({
        ...action.payload,
        id: nanoid(),
      });
    },
    addMediaHotspot: (
      state,
      action: PayloadAction<Omit<HotspotMedia, "id">>
    ) => {
      state.hotspotList.push({
        ...action.payload,
        id: nanoid(),
      });
    },
    addModelHotspot: (
      state,
      action: PayloadAction<Omit<HotspotModel, "id">>
    ) => {
      state.hotspotList.push({
        ...action.payload,
        id: nanoid(),
      });
    },
    deleteHotspot: (state, action: PayloadAction<string>) => {
      state.hotspotList = state.hotspotList.filter(
        (h) => h.id !== action.payload
      );
    },
    clearHotspot: (state) => {
      state.hotspotList = [];
    },
    updateModelHotspotModelUrl: (
      state,
      action: PayloadAction<{ id: string; modelUrl: string }>
    ) => {
      const index = state.hotspotList.findIndex(
        (h) => h.id === action.payload.id && h.type === 4
      );
      if (index !== -1) {
        (state.hotspotList[index] as HotspotModel).modelUrl =
          action.payload.modelUrl;
      }
    },
    updateIconId: (
      state,
      action: PayloadAction<{ hotspotId: string; iconId: number }>
    ) => {
      const index = state.hotspotList.findIndex(
        (h) => h.id === action.payload.hotspotId
      );
      if (index !== -1) {
        (state.hotspotList[index]).iconId =
          action.payload.iconId;
      }
    },
    // Nhận vào hotspot id và targetNodeId
    updateNavigationHotspotTarget: (
      state,
      action: PayloadAction<{ id: string; targetNodeId: string }>
    ) => {
      const index = state.hotspotList.findIndex(
        (h) => h.id === action.payload.id && h.type === 1
      );
      if (index !== -1) {
        (state.hotspotList[index] as HotspotNavigation).targetNodeId =
          action.payload.targetNodeId;
      }
    },
    // Nhận vào các thông số basicprop khi update config hotspot
    updateConfigHotspot: (
      state,
      action: PayloadAction<{ hotspotId: string; propHotspot: BaseHotspot }>
      ) => {
        const index = state.hotspotList.findIndex(h => h.id === action.payload.hotspotId);

      if (index !== -1) {
        state.hotspotList[index] = {
          ...state.hotspotList[index],
          ...action.payload.propHotspot,
        };  
      }
    }
  }
});

export const {
  addNavigationHotspot,
  addInformationHotspot,
  addMediaHotspot,
  addModelHotspot,
  deleteHotspot,
  clearHotspot,
  updateModelHotspotModelUrl,
  updateIconId,
  updateNavigationHotspotTarget,
  updateConfigHotspot
} = hotspotSlice.actions;
export default hotspotSlice.reducer;

// updateHotspot: (
//   state,
//   action: PayloadAction<{ id: string; updates: Partial<HotspotItem> }>
// ) => {
//   const index = state.hotspotList.findIndex(
//     (h) => h.id === action.payload.id
//   );
//   if (index !== -1) {
//     state.hotspotList[index] = {
//       ...state.hotspotList[index],
//       ...action.payload.updates,
//     };
//   }
// },
