import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface DataState {
  users: any[];
  messages: any[];
  fields: any[];
  spaces: any[];
  nodes: any[];
  hotspotTypes: any[];
  masterNodes: any[];
  preloadNodes: any[];
  activeNode: any;
  nodeOfUser: any[];
  defaultNode: any;
  trackNodes: any[];
  icons: any[];
  commentOfNode: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: DataState = {
  users: [],
  messages: [],
  fields: [],
  spaces: [],
  nodes: [],
  hotspotTypes: [],
  masterNodes: [],
  nodeOfUser: [],
  defaultNode: null,
  activeNode: null,
  trackNodes: [],
  preloadNodes: [],
  icons: [],
  commentOfNode: [],
  status: "idle",
};

// Fetch users
export const fetchUsers = createAsyncThunk(
  "data/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:8080/api/user", {
        headers: { Authorization: sessionStorage.getItem("token") },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Lấy danh sách người dùng thất bại. Vui lòng kiểm tra lại."
      );
    }
  }
);

// Fetch nodes
export const fetchNodes = createAsyncThunk("data/fetchNodes", async () => {
  const response = await axios.post(
    "http://localhost:8080/api/v1/admin/node/all"
  );
  return response.data.data;
});

// Fetch master nodes
export const fetchMasterNodes = createAsyncThunk(
  "data/fetchMasterNodes",
  async () => {
    const response = await axios.post("http://localhost:8080/api/node/master");
    return response.data.data;
  }
);

// Fetch default nodes
export const fetchDefaultNodes = createAsyncThunk(
  "data/fetchDefaultNodes",
  async () => {
    const response = await axios.post("http://localhost:8080/api/node/default");
    return response.data.data;
  }
);

// Fetch nodes of user
export const fetchNodeOfUser = createAsyncThunk(
  "data/fetchNodeOfUser",
  async (userId: number) => {
    console.log("userUd..", userId);
    const response = await axios.post("http://localhost:8080/api/node/byUser", {
      userId: userId,
    });
    return response.data.data;
  }
);

// Fetch comments of node
export const fetchCommentOfNode = createAsyncThunk(
  "data/fetchCommentOfNode",
  async (nodeId: number) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/comment/getOfNode",
        {
          nodeId: nodeId,
        }
      );
      if (response.data.data) {
        console.log(response.data.data);
        return response.data.data;
      }
    } catch (error: any) {
      console.error(error);
    }
  }
);

// Fetch field
export const fetchFields = createAsyncThunk("data/fetchFields", async () => {
  const response = await axios.get("http://localhost:8080/api/admin/field");
  return response.data.data;
});

// Fetch space
export const fetchSpaces = createAsyncThunk("data/fetchSpaces", async () => {
  const response = await axios.get("http://localhost:8080/api/admin/space/all");
  return response.data.data;
});

export const fetchActiveNode = createAsyncThunk(
  "data/fetchActiveNodes",
  async () => {
    const response = await axios.post("http://localhost:8080/api/node/default");
    return response.data.data;
  }
);

/**
 * Fetch dành cho Preload - Danh sách các node liên quan đến node đang tham quan.
 * + Nếu node đang tham quan là Master Node (status = 2)
 *  => Gọi và lấy preload (danh sách các node liên quan đến nó thông qua hotspot navigation) + các master node liên kết đến.
 * + Nếu node đang tham quan là Node con
 * => Không cần gọi API preload, mà chỉ thực hiện thêm node master vào mảng preload.
 */
export const fetchPreloadNodes = createAsyncThunk(
  "data/fetchPreloadNodes",
  async (nodeId: number, thunkAPI) => {
    try {
      const resp = await axios.post(
        `http://localhost:8080/api/node/preloadNodeList`,
        {
          nodeId,
        }
      );
      return resp.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Unknown error"
      );
    }
  }
);
// Fetch icon
export const fetchIcons = createAsyncThunk("data/fetchIcons", async () => {
  const response = await axios.get("http://localhost:8080/api/v1/admin/icon");
  return response.data.data;
});

// Fetch hotspot type
export const fetchHotspotTypes = createAsyncThunk(
  "data/fetchHotspotTypes",
  async () => {
    const response = await axios.get(
      "http://localhost:8080/api/admin/hotspotType"
    );
    return response.data.data;
  }
);

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setDefaultNode: (state, action) => {
      state.defaultNode = action.payload;
    },

    attachLocation: (
      state,
      action: PayloadAction<{
        spaceId: number;
        location: string;
      }>
    ) => {
      const index = state.spaces.findIndex(
        (h) => h.id === action.payload.spaceId
      );
      if (index !== -1) {
        const space = state.spaces[index];
        space.location = action.payload.location;
      }
    },

    removeLocation: (
      state,
      action: PayloadAction<{
        spaceId: number;
      }>
    ) => {
      console.log("spaceId...", action.payload.spaceId);
      const index = state.spaces.findIndex(
        (h) => h.id === action.payload.spaceId
      );
      if (index !== -1) {
        const space = state.spaces[index];
        space.location = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(fetchNodes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNodes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.nodes = action.payload;
      })
      .addCase(fetchNodes.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(fetchMasterNodes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMasterNodes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.masterNodes = action.payload;
      })
      .addCase(fetchMasterNodes.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(fetchDefaultNodes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDefaultNodes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.defaultNode = action.payload;
        localStorage.setItem("defaultNode", JSON.stringify(action.payload));
      })
      .addCase(fetchDefaultNodes.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(fetchFields.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFields.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.fields = action.payload;
      })
      .addCase(fetchFields.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(fetchSpaces.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSpaces.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.spaces = action.payload;
      })
      .addCase(fetchSpaces.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(fetchIcons.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchIcons.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.icons = action.payload;
      })
      .addCase(fetchIcons.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(fetchHotspotTypes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchHotspotTypes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.hotspotTypes = action.payload;
      })
      .addCase(fetchHotspotTypes.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(fetchPreloadNodes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPreloadNodes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.preloadNodes = action.payload;
      })
      .addCase(fetchPreloadNodes.rejected, (state) => {
        state.status = "failed";
      })
      /**
       * Visitor
       */
      .addCase(fetchNodeOfUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNodeOfUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.nodeOfUser = action.payload;
      })
      .addCase(fetchNodeOfUser.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(fetchCommentOfNode.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCommentOfNode.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.commentOfNode = action.payload;
      })
      .addCase(fetchCommentOfNode.rejected, (state) => {
        state.status = "failed";
      });
  },
});
export const { attachLocation, removeLocation, setDefaultNode } =
  dataSlice.actions;
export default dataSlice.reducer;
