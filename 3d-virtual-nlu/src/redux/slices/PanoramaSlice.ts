import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";
import { DEFAULT_ORIGINAL_Z } from "../../utils/Constants";
import { useSelector } from "react-redux";
import { RootState } from "../Store";

export interface PanoramaConfig {
  /**
   * + id: sử dụng nanoid để tạo id tạm trước khi đưa vào database.
   * => Điều này giúp đỡ phải lồng các hotspot vào gây khó khăn trong việc xử lý.
   *
   * + createdAt, updatedAt: default theo db
   * + status: phân biệt node chủ - node con.
   * Master node: status =2, Slave node : status =1
   */
  name: string;
  description: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  yawOffset: number;
  lightIntensity: number;
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: number;
  exposure: number;
  status: number;
}

export interface PanoramaItem {
  id: string; //nanoid => id là string.
  spaceId: string;
  url: string;
  config: PanoramaConfig;
}

export interface AutoPanoramaItem {
  id: string;
  url: string;
  config: PanoramaConfig;
  duration: number;
}

interface PanoramaState {
  panoramaList: PanoramaItem[] | any[];
  autoPanoramaList: AutoPanoramaItem[] | any[];
  currentAngleMaster: number;
  currentSelectId: string | null;
  spaceId: string | null;
}

const initialState: PanoramaState = {
  panoramaList: [],
  autoPanoramaList: [],
  currentAngleMaster: 0,
  currentSelectId: null,
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
      const userJson = sessionStorage.getItem("user");
      const user = userJson ? JSON.parse(userJson) : null;
      const panoramas = action.payload.map((item, index) => ({
        id: nanoid(),
        url: item.url,
        spaceId: state.spaceId!,
        config: {
          name: item.originalFileName,
          description: "",
          positionX: 0,
          positionY: 0,
          positionZ: DEFAULT_ORIGINAL_Z,
          yawOffset: 0,
          autoRotate: 0,
          speedRotate: 0,
          lightIntensity: 1,
          brightness: 0,
          contrast: 1,
          saturation: 1,
          grayscale: 0,
          exposure: 1,
          status: index === 0 ? (user.roleId == 2 ? 2 : 3) : 1,
        },
      }));
      state.panoramaList = panoramas;
      state.currentSelectId = panoramas[0]?.id || null;
    },
    
    addAutoPanorama(state, action: PayloadAction<{  node: any; duration?: number }>) {
      const existing = state.autoPanoramaList.find(p => p.originalNodeId === action.payload.node.id);
      if (!existing) {
        state.autoPanoramaList.push({
          ...action.payload.node,
          duration: action.payload.duration || 5,
          originalNodeId: action.payload.node.id,
        });
      }
      state.currentSelectId = state.autoPanoramaList[0]?.id || null;
    },

    removeAutoPanorama(state, action: PayloadAction<string>) {
      state.autoPanoramaList = state.autoPanoramaList.filter(p => p.originalNodeId !== action.payload);
    },

    //Upload thêm panorama khi trong tour.
    addPanorama(state, action: PayloadAction<string>) {
      if (state.panoramaList.length < 5 && state.spaceId !== null) {
        const newPanorama: PanoramaItem = {
          id: nanoid(),
          url: action.payload,
          spaceId: state.spaceId,
          config: {
            name: "",
            description: "",
            positionX: 0,
            positionY: 0,
            positionZ: DEFAULT_ORIGINAL_Z,
            yawOffset: 0,
            brightness: 0,
            contrast: 1,
            saturation: 1,
            grayscale: 0,
            exposure: 1,
            lightIntensity: 1,
            status: 1,
          },
        };

        state.panoramaList.push(newPanorama);
        // nếu cần thiết, nên cho nó là cái được chọn luôn.
        // state.currentSelectId = newPanorama.id;
      }
    },

    addPanoramasFromResponse(state, action: PayloadAction<PanoramaItem[]>) {
      const panoramas = action.payload;

      state.panoramaList = panoramas;

      // Ưu tiên chọn panorama đầu tiên có status = 2 (master), nếu không thì chọn đầu tiên
      const master = panoramas.find((p) => p.config.status === 2);
      state.currentSelectId = master?.id || panoramas[0]?.id || null;

      // Đồng bộ vị trí
      // state.currentSelectedPosition = panoramas.findIndex(
      //   (p) => p.id === state.currentSelectId
      // );
    },
    selectPanorama(state, action: PayloadAction<string>) {
      // state.currentSelectedPosition = action.payload;
      state.currentSelectId = action.payload;
    },
    setMasterPanorama(state, action: PayloadAction<string>) {
      const masterId = action.payload;
      state.panoramaList.forEach((item) => {
        item.config.status = item.id === masterId ? 2 : 1;
      });
    },
    updatePanoConfig(
      state,
      action: PayloadAction<{ id: string; config: Partial<PanoramaConfig> }>
    ) {
      const { id, config } = action.payload;
      const pano = state.panoramaList.find((p) => p.id === id);
      if (pano) {
        pano.config = {
          ...pano.config,
          ...config,
        };
      }
    },
    
    updateAutoPanoConfig(
      state,
      action: PayloadAction<{ id: string; duration : number }>
    ) {
      const { id, duration } = action.payload;
      const pano = state.autoPanoramaList.find((p) => p.id === id);
      if (pano) {
        pano.duration = duration;
      }
    },

    renameMasterAndUpdateSlaves(
      state,
      action: PayloadAction<{ id: string; newName: string }>
    ) {
      const { id, newName } = action.payload;

      // Tìm master panorama
      const master = state.panoramaList.find((p) => p.id === id);
      if (!master) return;

      // Cập nhật tên mới cho master
      master.config.name = newName;

      // Đổi tên tất cả panorama còn lại (status = 1)
      let count = 1;
      for (const pano of state.panoramaList) {
        if (pano.id !== id && pano.config.status === 1) {
          pano.config.name = `${newName}_${count++}`;
        }
      }
    },
    updateCurrentAngleMaster(state, action: PayloadAction<number>) {
      state.currentAngleMaster = action.payload;
    },
    // deletePanorame(state, action: PayloadAction<number>) {
    //   const deleted = state.panoramaList.splice(action.payload, 1);
    //   if (state.currentSelectedPosition >= state.panoramaList.length) {
    //     s;
    //   }
    // },
    clearPanorama(state) {
        (state.panoramaList = []),
        (state.autoPanoramaList = []),
        (state.currentAngleMaster = 0),
        (state.currentSelectId = null);
    },
  },
});

export const {
  setSpaceId,
  setPanoramas,
  addAutoPanorama,
  removeAutoPanorama,
  addPanorama,
  addPanoramasFromResponse,
  selectPanorama,
  setMasterPanorama,
  updatePanoConfig,
  updateAutoPanoConfig,
  renameMasterAndUpdateSlaves,
  updateCurrentAngleMaster,
  clearPanorama,
} = panoramaSlice.actions;
export default panoramaSlice.reducer;
