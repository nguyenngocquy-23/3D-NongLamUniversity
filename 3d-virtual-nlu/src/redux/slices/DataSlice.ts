import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URLS } from "../../env";
import { safeParseJsonArray } from "../../utils/ParseJsonArray";

interface DataState {
  users: any[];
  messages: any[];
  fields: any[];
  spaces: any[];
  nodes: any[];
  hotspotTypes: any[];
  masterNodes: any[];
  preloadNodes: any[];
  nodeOfUser: any[];
  privateNodeOfUser: any[];
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
  privateNodeOfUser: [],
  defaultNode: null,
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
      const response = await axios.get(API_URLS.USER, {
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
    API_URLS.ADMIN_GET_ALL_NODES
  );
  return response.data.data;
});

// Fetch master nodes
export const fetchMasterNodes = createAsyncThunk(
  "data/fetchMasterNodes",
  async () => {
    const response = await axios.post(API_URLS.GET_MASTER_NODES);
    return response.data.data;
  }
);

// Fetch default nodes
export const fetchDefaultNodes = createAsyncThunk(
  "data/fetchDefaultNodes",
  async () => {
    const response = await axios.post(API_URLS.GET_DEFAULT_NODE);
    return response.data.data;
  }
);

// Fetch nodes of user
export const fetchNodeOfUser = createAsyncThunk(
  "data/fetchNodeOfUser",
  async (userId: number) => {
    const response = await axios.post(API_URLS.NODE_OF_USER, {
      userId: userId,
    });
    return response.data.data;
  }
);

// Fetch private nodes of user
export const fetchPrivateNodeOfUser = createAsyncThunk(
  "data/fetchPrivateNodeOfUser",
  async (userId: number) => {
    const response = await axios.post(API_URLS.PRIVATE_NODE_OF_USER, {
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
        API_URLS.COMMENT_OF_NODE,
        {
          nodeId: nodeId,
        }
      );
      if (response.data.data) {
        return response.data.data;
      }
    } catch (error: any) {
      console.error(error);
    }
  }
);

// Fetch field
export const fetchFields = createAsyncThunk("data/fetchFields", async () => {
  const response = await axios.get(API_URLS.ADMIN_GET_ALL_FIELDS);
  return response.data.data;
});

// Fetch space
export const fetchSpaces = createAsyncThunk("data/fetchSpaces", async () => {
  const response = await axios.get(API_URLS.ADMIN_GET_ALL_SPACES);
  const rawSpaces = response.data.data;

  const parsedSpaces = rawSpaces.map((space: any) => ({
    ...space,
    tourIds: safeParseJsonArray(space.tourIds),
  }));

  return parsedSpaces;
});

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
        API_URLS.GET_PRELOAD_NODES,
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
  const response = await axios.get(API_URLS.ADMIN_GET_ALL_ICONS);
  return response.data.data;
});

// Fetch hotspot type
export const fetchHotspotTypes = createAsyncThunk(
  "data/fetchHotspotTypes",
  async () => {
    const response = await axios.get(
      API_URLS.ADMIN_GET_HOTSPOT_TYPES
    );
    return response.data.data;
  }
);

//Fetch lấy thông tin của node trong 1 spaces
export const fetchToursFromSpace = createAsyncThunk(
  "data/fetchToursFromSpace",
  async (tourIds: number[], { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/admin/node/many",
        { ids: tourIds }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Lỗi tải danh sách node từ tourIds."
      );
    }
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
      const index = state.spaces.findIndex(
        (h) => h.id === action.payload.spaceId
      );
      if (index !== -1) {
        const space = state.spaces[index];
        space.location = null;
      }
    },

    changeFieldName: (
      state,
      action: PayloadAction<{ fieldId: number; name: string; code: string }>
    ) => {
      const index = state.fields.findIndex(
        (f) => f.id === action.payload.fieldId
      );
      if (index !== -1) {
        state.fields[index].name = action.payload.name;
        state.fields[index].code = action.payload.code;
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
      
      .addCase(fetchPrivateNodeOfUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPrivateNodeOfUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.privateNodeOfUser = action.payload;
      })
      .addCase(fetchPrivateNodeOfUser.rejected, (state) => {
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
      })
      .addCase(fetchToursFromSpace.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchToursFromSpace.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.trackNodes = action.payload;
      })
      .addCase(fetchToursFromSpace.rejected, (state) => {
        state.status = "failed";
      });
  },
});
export const { attachLocation, removeLocation, setDefaultNode } =
  dataSlice.actions;
export default dataSlice.reducer;
