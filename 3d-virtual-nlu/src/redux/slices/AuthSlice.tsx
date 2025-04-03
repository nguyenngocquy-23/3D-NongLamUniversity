import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Định nghĩa kiểu dữ liệu người dùng
interface User {
  id: string;
  name: string;
  email: string;
  token: string;
}
// Định nghĩa interface cho trạng thái đăng nhập
interface AuthState {
  user: any;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Trạng thái ban đầu
const initialState: AuthState = {
  user: JSON.parse(sessionStorage.getItem('user') || 'null'),
  token: sessionStorage.getItem('token') || 'null',
  isLoading: false,
  error: null,
};

// Thunk API đăng nhập
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // Gọi API đăng nhập
      const response = await axios.post("http://localhost:8080/api/login", {
        username,
        password,
      });
      if (response.data.statusCode !== 1000) {
        throw new Error(
          response.data.message || "Invalid username or password"
        );
      }

      // Gọi API lấy thông tin user
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

      return {
        user: userResponse.data,
        token: response.data.data.token,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại."
      );
    }
  }
);

// Slice Redux
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export const { logoutUser } = authSlice.actions;
export default authSlice.reducer;
