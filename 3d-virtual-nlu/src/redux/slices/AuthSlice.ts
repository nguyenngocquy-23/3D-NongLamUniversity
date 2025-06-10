import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { scheduleTokenRefresh } from "../../utils/ScheduleRefreshToken";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../Store";
import { API_URLS } from "../../env";

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

// Thunk đăng ký
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    { username, email, password, avatar }: { username: string; email: string; password: string; avatar: string },
    thunkAPI
  ) => {
    try {
      const response = await axios.post(API_URLS.REGISTER, {
        username,
        email,
        password,
        avatar,
      });

      if (!response.data) {
        throw new Error(
          response.data.message || "Invalid username or password"
        );
      }
      sessionStorage.setItem("userId", response.data);
      return response.data;
    } catch (error: any) {
      if (error.code === "ERR_NETWORK") {
        return thunkAPI.rejectWithValue(
          "Không thể kết nối đến server. Vui lòng thử lại sau."
        );
      }
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Tài khoản hoặc mật khẩu không hợp lệ. Vui lòng thử lại."
      );
    }
  }
);

// Thunk xác thực tài khoản
export const verifyUser = createAsyncThunk(
  "auth/verifyUser",
  async (
    { userId, token }: { userId: number; token: string },
    thunkAPI
  ) => {
    try {
      const response = await axios.post(API_URLS.VERIFY, {
        userId,
        token,
      });

      if (!response.data) {
        throw new Error(
          response.data.message || "Verify fail"
        );
      }
      return response.data.data;
    } catch (error: any) {
      if (error.code === "ERR_NETWORK") {
        return thunkAPI.rejectWithValue(
          "Không thể kết nối đến server. Vui lòng thử lại sau."
        );
      }
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Mã xác thực không hợp lệ. Vui lòng thử lại."
      );
    }
  }
);

// Thunk quên mật khẩu
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (
    { email }: { email: string },
    thunkAPI
  ) => {
    try {
      const response = await axios.post(API_URLS.FORGOT_PASSWORD, {
        email
      });

      if (!response.data) {
        throw new Error(
          response.data.message || "Change password fail"
        );
      }
      return response.data.data;
    } catch (error: any) {
      if (error.code === "ERR_NETWORK") {
        return thunkAPI.rejectWithValue(
          "Không thể kết nối đến server. Vui lòng thử lại sau."
        );
      }
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Đổi mật khẩu thất bại. Vui lòng thử lại."
      );
    }
  }
);

// Thunk đăng nhập
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    { username, password }: { username: string; password: string },
    thunkAPI
  ) => {
    try {
      const response = await axios.post(API_URLS.LOGIN, {
        username,
        password,
      });

      if (response.data.statusCode !== 1000) {
        throw new Error(
          response.data.message || "Invalid username or password"
        );
      }

      const userResponse = await axios.post(
        API_URLS.USER,
        { username },
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

// Thunk cập nhật user
export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (
     username: string ,
    thunkAPI
  ) => {
    try {
      console.log('username :', username)
      const userResponse = await axios.post(
        API_URLS.USER,
        { username: username,
          password: null
         },
        {
          headers: {
            Authorization: sessionStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        }
      );

      return {
        user: userResponse.data,
      };
    } catch (error: any) {
      if (error.code === "ERR_NETWORK") {
        return thunkAPI.rejectWithValue(
          "Không thể kết nối đến server. Vui lòng thử lại sau."
        );
      }
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          "Lỗi cập nhật user. Vui lòng thử lại."
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
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      await axios.post(API_URLS.LOGOUT, { token });


      // Xoá sessionStorage
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
        API_URLS.REFRESH_TOKEN,
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

      // FETCH USER
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        sessionStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // VERIFY
      .addCase(verifyUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      //  FORGOTP_ASSWORD
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
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
