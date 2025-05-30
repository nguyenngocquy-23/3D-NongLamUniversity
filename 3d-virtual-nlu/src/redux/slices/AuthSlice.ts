import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { scheduleTokenRefresh } from "../../utils/ScheduleRefreshToken";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../Store";

// Kiểu dữ liệu người dùng
export interface User {
  id: string;
  name: string;
  email: string;
  token: string;
}

// Trạng thái xác thực
interface AuthState {
  user: any;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Trạng thái ban đầu
const initialState: AuthState = {
  user: JSON.parse(sessionStorage.getItem("user") || "null"),
  token: sessionStorage.getItem("token") || null,
  isLoading: false,
  error: null,
};

// Thunk đăng nhập
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    { username, password }: { username: string; password: string },
    thunkAPI
  ) => {
    try {
      const response = await axios.post("http://localhost:8080/api/login", {
        username,
        password,
      });

      if (response.data.statusCode !== 1000) {
        throw new Error(
          response.data.message || "Invalid username or password"
        );
      }

      const userResponse = await axios.post(
        "http://localhost:8080/api/user",
        { username, password },
        {
          headers: {
            Authorization: response.data.data.token,
            "Content-Type": "application/json",
          },
        }
      );

      // Gọi scheduleTokenRefresh với dispatch từ thunkAPI
      scheduleTokenRefresh(
        response.data.data.token,
        thunkAPI.dispatch as AppDispatch
      );

      return {
        user: userResponse.data,
        token: response.data.data.token,
      };
    } catch (error: any) {
      if (error.code === "ERR_NETWORK") {
        return thunkAPI.rejectWithValue(
          "Không thể kết nối đến server. Vui lòng thử lại sau."
        );
      }
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại."
      );
    }
  }
);

// Thunk đăng xuất
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.post("http://localhost:8080/api/authenticate/logout", {
        token,
      });

      // Xoá sessionStorage
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      return;
    } catch (error: any) {
      return rejectWithValue(
        "Không thể kết nối đến server. Vui lòng thử lại sau."
      );
    }
  }
);

// Thunk làm mới token
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/authenticate/refresh",
        {
          token,
        }
      );
      sessionStorage.setItem("token", response.data.data.token);
      return response.data.data.token;
    } catch (error: any) {
      return rejectWithValue(
        "Không thể kết nối đến server. Vui lòng thử lại sau."
      );
    }
  }
);

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        sessionStorage.setItem("user", JSON.stringify(action.payload.user));
        sessionStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // LOGOUT
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // REFRESH TOKEN
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default authSlice.reducer;
