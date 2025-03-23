import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface DataState {
  users: any[];
  messages: any[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: DataState = {
  users: [],
  messages: [],
  status: "idle",
};

// Fetch users
export const fetchUsers = createAsyncThunk("data/fetchUsers", async () => {
  const response = await axios.get("https://jsonplaceholder.typicode.com/users");
  return response.data;
});

// Fetch tours
export const fetchTours = createAsyncThunk("data/fetchTours", async () => {
  const response = await axios.get("https://jsonplaceholder.typicode.com/tours");
  return response.data;
});

// Fetch message
export const fetchMessages = createAsyncThunk("data/fetchMessages", async () => {
  const response = await axios.get("https://jsonplaceholder.typicode.com/messages");
  return response.data;
});

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

      .addCase(fetchMessages.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default dataSlice.reducer;
