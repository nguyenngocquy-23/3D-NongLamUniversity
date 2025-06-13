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
  targetNodeId: string;
}
export interface HotspotInformation extends BaseHotspot {
  title: string;
  content: string;
}
export interface HotspotMedia extends BaseHotspot {
  mediaType: string; //image or video
  mediaUrl: string;
  caption: string;
  cornerPointList: string; // JSON string representing corner points
}
export interface HotspotModel extends BaseHotspot {
  modelUrl: string;
  name: string;
  description: string;
  autoRotate: number; //0 = false, 1= true.
  colorCode: string;
}

interface HotspotPositions {
  nodeId: string;
  hotspotPositions: [number, number, number][];
}

export type HotspotItem =
  | HotspotNavigation
  | HotspotInformation
  | HotspotMedia
  | HotspotModel;

interface HotspotState {
  hotspotList: HotspotItem[];
  hotspotPositions: HotspotPositions[];
}

const initialState: HotspotState = {
  hotspotList: [],
  hotspotPositions: [],
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
    clearHotspotNavigation: (state) => {
      state.hotspotList = state.hotspotList.filter((h) => h.type !== 1);
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
        state.hotspotList[index].iconId = action.payload.iconId;
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
      const index = state.hotspotList.findIndex(
        (h) => h.id === action.payload.hotspotId
      );

      if (index !== -1) {
        const {
          id,
          nodeId,
          positionX,
          positionY,
          positionZ,
          ...propsWithoutId
        } = action.payload.propHotspot as any;
        state.hotspotList[index] = {
          ...state.hotspotList[index],
          ...propsWithoutId,
        };
      }
    },

    updateHotspotInfomation: (
      state,
      action: PayloadAction<{
        hotspotId: string;
        title: string;
        content: string;
      }>
    ) => {
      const index = state.hotspotList.findIndex(
        (h) => h.id === action.payload.hotspotId
      );
      if (index !== -1) {
        const hotspot = state.hotspotList[index];
        if (hotspot.type === 2) {
          (hotspot as HotspotInformation).title = action.payload.title;
          (hotspot as HotspotInformation).content = action.payload.content;
        }
      }
    },

    updateHotspotModel: (
      state,
      action: PayloadAction<{
        hotspotId: string;
        modelUrl: string;
        name: string;
        description: string;
      }>
    ) => {
      const index = state.hotspotList.findIndex(
        (h) => h.id === action.payload.hotspotId
      );
      if (index !== -1) {
        const hotspot = state.hotspotList[index];
        if (hotspot.type === 4) {
          (hotspot as HotspotModel).modelUrl = action.payload.modelUrl;
          (hotspot as HotspotModel).name = action.payload.name;
          (hotspot as HotspotModel).description = action.payload.description;
        }
      }
    },

    updateHotspotMedia: (
      state,
      action: PayloadAction<{
        hotspotId: string;
        mediaUrl: string;
        mediaType: string;
        caption: string;
      }>
    ) => {
      const index = state.hotspotList.findIndex(
        (h) => h.id === action.payload.hotspotId
      );
      if (index !== -1) {
        const hotspot = state.hotspotList[index];
        if (hotspot.type === 3) {
          (hotspot as HotspotMedia).mediaUrl = action.payload.mediaUrl;
          (hotspot as HotspotMedia).mediaType = action.payload.mediaType;
          (hotspot as HotspotMedia).caption = action.payload.caption;
        }
      }
    },
    updateCornerHotspotMedia: (
      state,
      action: PayloadAction<{
        hotspotId: string;
        cornerPointList: [number, number, number][]; // mảng mới
      }>
    ) => {
      const { hotspotId, cornerPointList } = action.payload;

      const index = state.hotspotList.findIndex((h) => h.id === hotspotId);
      if (index !== -1) {
        const hotspot = state.hotspotList[index];
        if (hotspot.type === 3) {
          // Cập nhật cornerPointList dưới dạng JSON string mới
          (hotspot as HotspotMedia).cornerPointList =
            JSON.stringify(cornerPointList);
        }
      }
    },

    removeHotspot: (state, action: PayloadAction<{ hotspotId: string }>) => {
      const index = state.hotspotList.findIndex(
        (h) => h.id === action.payload.hotspotId
      );
      if (index !== -1) {
        const hotspot = state.hotspotList.find(
          (h) => h.id === action.payload.hotspotId
        );

        if (!hotspot) return; // Nếu không tìm thấy thì thoát

        const { positionX, positionY, positionZ } = hotspot;

        // Duyệt từng nodeId trong hotspotPositions
        state.hotspotPositions = state.hotspotPositions
          .map((node) => ({
            ...node,
            hotspotPositions: node.hotspotPositions.filter(
              ([x, y, z]) =>
                !(x === positionX && y === positionY && z === positionZ)
            ),
          }))
          // Xóa luôn node nếu mảng vị trí rỗng sau filter
          .filter((node) => node.hotspotPositions.length > 0);

        state.hotspotList = state.hotspotList.filter(
          (h) => h.id !== action.payload.hotspotId
        );
      }
    },

    addHotspotPosition: (
      state,
      action: PayloadAction<{
        nodeId: string;
        hotspotPosition: [number, number, number];
      }>
    ) => {
      const { nodeId, hotspotPosition } = action.payload;

      const index = state.hotspotPositions.findIndex(
        (h) => h.nodeId === nodeId
      );

      if (index === -1) {
        // Nếu nodeId chưa tồn tại => thêm mới
        state.hotspotPositions.push({
          nodeId,
          hotspotPositions: [hotspotPosition],
        });
      } else {
        // Nếu đã có nodeId => chỉ thêm vào danh sách vị trí
        state.hotspotPositions[index].hotspotPositions.push(hotspotPosition);
      }
    },
  },
});

export const {
  addNavigationHotspot,
  addInformationHotspot,
  addMediaHotspot,
  addModelHotspot,
  deleteHotspot,
  clearHotspot,
  clearHotspotNavigation,
  updateModelHotspotModelUrl,
  updateIconId,
  updateNavigationHotspotTarget,
  updateConfigHotspot,
  updateHotspotInfomation,
  updateHotspotModel,
  updateHotspotMedia,
  updateCornerHotspotMedia,
  removeHotspot,
  addHotspotPosition,
} = hotspotSlice.actions;
export default hotspotSlice.reducer;
