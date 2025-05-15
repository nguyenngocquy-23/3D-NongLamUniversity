import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface DataState {
  users: any[];
  messages: any[];
  fields: any[];
  spaces: any[];
  nodes: any[];
  hotspotTypes: any[];
  masterNodes: any[];
  icons: any[];
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
  icons: [],
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
  console.log("nodes........", response.data.data);
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
  reducers: {},
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
      });
  },
});

export default dataSlice.reducer;
