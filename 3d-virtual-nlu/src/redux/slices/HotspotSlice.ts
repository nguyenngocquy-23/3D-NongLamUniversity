import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";
import { rgbaColor } from "../../utils/TransformRgbaColor";

//Test trước, sau đó dùng API để lấy.
export type HotspotType = 1 | 2 | 3 | 4;

export interface BaseHotspot {
  id: string;
  nodeId: string;
  iconId: number;
  status: number;
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
  content: string;
  backgroundColorContent: rgbaColor; //JSON string representing bkgColor
  borderColorContent: string;
  borderSizeContent: number;
}
export interface HotspotMedia extends BaseHotspot {
  mediaType: string; //image or video
  mediaUrl: string;
  caption: string;
  cornerPointList: string; // JSON string representing corner points
}
export interface HotspotModel extends BaseHotspot {
  modelUrl: string;
  thumbnailUrl: string;
  name: string;
  description: string;
  autoRotate: number; //0 = false, 1= true.
  colorCode: string;
}

interface HotspotPositions {
  nodeId: string;
  hotspotPositions: {
    id: string;
    position: [number, number, number];
  }[];
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
      action: PayloadAction<HotspotNavigation>
      // action: PayloadAction<Omit<HotspotNavigation, "id">>
    ) => {
      state.hotspotList.push({
        ...action.payload,
        id: nanoid(),
      });
    },
    addInformationHotspot: (
      state,
      action: PayloadAction<HotspotInformation>
    ) => {
      state.hotspotList.push({
        ...action.payload,
        id: nanoid(),
      });
    },
    addMediaHotspot: (
      state,
      action: PayloadAction<HotspotMedia>
      // action: PayloadAction<Omit<HotspotMedia, "id">>
    ) => {
      state.hotspotList.push({
        ...action.payload,
        id: nanoid(),
      });
    },
    addModelHotspot: (
      state,
      action: PayloadAction<HotspotModel>
      // action: PayloadAction<Omit<HotspotModel, "id">>
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
    deleteHotspotByNodeId: (state, action: PayloadAction<string>) => {
      const nodeIdToDelete = action.payload;

      state.hotspotList = state.hotspotList.filter(
        (h) =>
          h.nodeId !== nodeIdToDelete &&
          !(
            h.type === 1 &&
            "targetNodeId" in h &&
            h.targetNodeId === nodeIdToDelete
          )
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
          ...(positionX !== undefined && { positionX }),
          ...(positionY !== undefined && { positionY }),
          ...(positionZ !== undefined && { positionZ }),
        };
        // Nếu có ít nhất 1 trong 3 positionX/Y/Z thì cập nhật lại position
        if (
          positionX !== undefined ||
          positionY !== undefined ||
          positionZ !== undefined
        ) {
          const node = state.hotspotPositions.find(
            (n) => n.nodeId == (nodeId ?? state.hotspotList[index].nodeId)
          );

          if (node) {
            const hotspotIndex = node.hotspotPositions.findIndex(
              (h) => h.id == action.payload.hotspotId
            );
            if (hotspotIndex != -1) {
              const oldHotspot = node.hotspotPositions[hotspotIndex];

              const updatedPosition: [number, number, number] = [
                positionX !== undefined ? positionX : oldHotspot.position[0],
                positionY !== undefined ? positionY : oldHotspot.position[1],
                positionZ !== undefined ? positionZ : oldHotspot.position[2],
              ];

              node.hotspotPositions[hotspotIndex] = {
                ...oldHotspot,
                position: updatedPosition,
              };
            }
          }
        }
      }
    },

    updateHotspotInformation: (
      state,
      action: PayloadAction<{
        hotspotId: string;
        content: string;
        backgroundColorContent: rgbaColor;
        borderColorContent: string;
        borderSizeContent: number;
      }>
    ) => {
      const index = state.hotspotList.findIndex(
        (h) => h.id === action.payload.hotspotId
      );
      if (index !== -1) {
        const hotspot = state.hotspotList[index];
        if (hotspot.type === 2) {
          (hotspot as HotspotInformation).content = action.payload.content;
          (hotspot as HotspotInformation).backgroundColorContent =
            action.payload.backgroundColorContent;
          (hotspot as HotspotInformation).borderColorContent =
            action.payload.borderColorContent;
          (hotspot as HotspotInformation).borderSizeContent =
            action.payload.borderSizeContent;
        }
      }
    },

    updateHotspotModel: (
      state,
      action: PayloadAction<{
        hotspotId: string;
        modelUrl: string;
        thumbnailUrl: string;
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
          (hotspot as HotspotModel).thumbnailUrl = action.payload.thumbnailUrl;
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
    updateCornerPoint: (
      state,
      action: PayloadAction<{
        hotspotId: string; // id của hotspot cần cập nhật
        index: number; // index của điểm cần cập nhật
        point: [number, number, number]; // điểm mới
      }>
    ) => {
      const { index, point } = action.payload;
      const hotspot = state.hotspotList.find(
        (h) => h.type === 3 && h.id === action.payload.hotspotId
      ) as HotspotMedia | undefined;
      if (hotspot) {
        // Chuyển đổi cornerPointList từ JSON string sang mảng
        const cornerPointList = JSON.parse(hotspot.cornerPointList || "[]") as [
          number,
          number,
          number
        ][];

        // Cập nhật điểm tại index
        if (index >= 0 && index < cornerPointList.length) {
          cornerPointList[index] = point;
          // Cập nhật lại cornerPointList dưới dạng JSON string
          hotspot.cornerPointList = JSON.stringify(cornerPointList);
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
        (h) => h.id == action.payload.hotspotId
      );
      if (index !== -1) {
        const hotspot = state.hotspotList.find(
          (h) => h.id == action.payload.hotspotId
        );
        console.log("removeHotspot hotspot: ", action.payload.hotspotId);
        if (!hotspot) return; // Nếu không tìm thấy thì thoát

        // Duyệt từng nodeId trong hotspotPositions
        state.hotspotPositions = state.hotspotPositions
          .map((node) => ({
            ...node,
            hotspotPositions: node.hotspotPositions
              .filter((h) => !(h.id == hotspot.id))
              .filter((h) => h.position[0] != hotspot.positionX),
          }))
          // Xóa luôn node nếu mảng vị trí rỗng sau filter
          .filter((node) => node.hotspotPositions.length > 0);
        state.hotspotList = state.hotspotList.filter(
          (h) => h.id != action.payload.hotspotId
        );
      }
    },

    updateHotspotStatus: (
      state,
      action: PayloadAction<{ hotspotId: string }>
    ) => {
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
              (h) => !(h.id == hotspot.id)
            ),
          }))
          // Xóa luôn node nếu mảng vị trí rỗng sau filter
          .filter((node) => node.hotspotPositions.length > 0);
        hotspot.status = 0; // Cập nhật trạng thái hotspot thành 0
      }
    },

    addHotspotPosition: (
      state,
      action: PayloadAction<{
        nodeId: string;
        hotspotPosition: any;
      }>
    ) => {
      const { nodeId, hotspotPosition } = action.payload;

      const index = state.hotspotPositions.findIndex((h) => h.nodeId == nodeId);

      if (index === -1) {
        // Nếu nodeId chưa tồn tại => thêm mới
        state.hotspotPositions.push({
          nodeId,
          hotspotPositions: [
            {
              id: hotspotPosition.id,
              position: hotspotPosition.position,
            },
          ],
        });
      } else {
        state.hotspotPositions[index].hotspotPositions.push({
          id: hotspotPosition.id,
          position: hotspotPosition.position,
        });
      }
    },

    addHotspotsFromResponse: (state, action: PayloadAction<HotspotItem[]>) => {
      const hotspots = action.payload ?? [];

      state.hotspotList = hotspots;
      state.hotspotPositions = hotspots.map((h) => ({
        nodeId: h.nodeId,
        hotspotPositions: [
          {
            id: h.id,
            position: [h.positionX, h.positionY, h.positionZ],
          },
        ],
      }));
    },
  },
});

export const {
  addNavigationHotspot,
  addInformationHotspot,
  addMediaHotspot,
  addModelHotspot,
  deleteHotspot,
  deleteHotspotByNodeId,
  clearHotspot,
  clearHotspotNavigation,
  updateModelHotspotModelUrl,
  updateIconId,
  updateNavigationHotspotTarget,
  updateConfigHotspot,
  updateHotspotInformation,
  updateHotspotModel,
  updateHotspotMedia,
  updateCornerPoint,
  updateCornerHotspotMedia,
  removeHotspot,
  updateHotspotStatus,
  addHotspotPosition,
  addHotspotsFromResponse,
} = hotspotSlice.actions;
export default hotspotSlice.reducer;
