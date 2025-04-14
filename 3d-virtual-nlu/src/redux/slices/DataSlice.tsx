import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface DataState {
  users: any[];
  messages: any[];
  fields: any[];
  spaces: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: DataState = {
  users: [],
  messages: [],
  fields: [],
  spaces: [],
  status: "idle",
};

// Fetch users
export const fetchUsers = createAsyncThunk("data/fetchUsers", async (_,{ rejectWithValue }) => {
  try{
    const response = await axios.get(
      "http://localhost:8080/api/user",
      {
        headers: {Authorization: sessionStorage.getItem("token")}
      }
    );
    return response.data.data;
  }catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Lấy danh sách người dùng thất bại. Vui lòng kiểm tra lại.");
  }
});

// Fetch tours
export const fetchTours = createAsyncThunk("data/fetchTours", async () => {
  const response = await axios.get(
    "https://jsonplaceholder.typicode.com/tours"
  );
  return response.data;
});

// Fetch field
export const fetchFields = createAsyncThunk(
  "data/fetchFields",
  async () => {
    const response = await axios.get(
      "http://localhost:8080/api/admin/field"
    );
    return response.data.data;
  }
);
// Fetch space
export const fetchSpaces = createAsyncThunk(
  "data/fetchSpaces",
  async () => {
    const response = await axios.get(
      "http://localhost:8080/api/admin/space/all"
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

      .addCase(fetchTours.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTours.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchTours.rejected, (state) => {
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
      });
  },
});

export default dataSlice.reducer;
