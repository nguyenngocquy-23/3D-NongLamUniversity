import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";
import { DEFAULT_ORIGINAL_Z } from "../../utils/Constants";

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
  autoRotate: number;
  speedRotate: number;
  lightIntensity: number;
  status: number;
}

export interface PanoramaItem {
  id: string; //nanoid => id là string.
  spaceId: string;
  url: string;
  config: PanoramaConfig; 
}

interface PanoramaState {
  panoramaList: PanoramaItem[];
  currentSelectedPosition: number;
  currentSelectId: string | null;
  spaceId: string | null;
}

const initialState: PanoramaState = {
  panoramaList: [],
  currentSelectedPosition: 0,
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
          autoRotate: 0,
          speedRotate: 0,
          lightIntensity: 1,
          status: index === 0 ? user.username == 'admin' ? 2 : 3 : 1,
        },
      }));
      state.panoramaList = panoramas;
      state.currentSelectId = panoramas[0]?.id || null;
      state.currentSelectedPosition = 0;
    },

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
            autoRotate: 0,
            speedRotate: 0,
            lightIntensity: 1,
            status: 1,
          },
        };

        state.panoramaList.push(newPanorama);
        // nếu cần thiết, nên cho nó là cái được chọn luôn.
        // state.currentSelectId = newPanorama.id;
      }
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
    // deletePanorame(state, action: PayloadAction<number>) {
    //   const deleted = state.panoramaList.splice(action.payload, 1);
    //   if (state.currentSelectedPosition >= state.panoramaList.length) {
    //     s;
    //   }
    // },
    clearPanorama(state) {
      (state.panoramaList = []),
        (state.currentSelectedPosition = 0),
        (state.currentSelectId = null),
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
  renameMasterAndUpdateSlaves,
  clearPanorama,
} = panoramaSlice.actions;
export default panoramaSlice.reducer;
