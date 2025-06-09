import axios from "axios";
import {jwtDecode} from "jwt-decode";
import { logoutUser, refreshToken } from "../redux/slices/AuthSlice";
import { AppDispatch } from "../redux/Store";
import { formatTimestampToDate } from "./formatDateTime";

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleTokenRefresh(token: string, dispatch: AppDispatch) {
  const { exp } = jwtDecode<{ exp: number }>(token);
  const expiresAt = exp * 1000;
  const now = Date.now();

  console.log('refresh token start:', formatTimestampToDate(expiresAt));
  
  /**
   * refresh token trước khi hết hạn 1 '
  */
 const duration = 5*60000;
 const delay = expiresAt - now - duration;
 console.log('delay:', delay);

  if (refreshTimer){
    console.log('refreshTimer..', refreshTimer)
    clearTimeout(refreshTimer);
  }
  if (delay <= 0) {
    // Token sắp hết hạn hoặc đã hết hạn → gọi refresh ngay
    refreshAccessToken(token, dispatch);
  } else {
    // Token còn hạn → setTimeout để refresh trước 1 phút
    refreshTimer = setTimeout(() => {
      console.log('Calling refreshAccessToken');
      refreshAccessToken(token, dispatch);
    }, delay);
  }
}

async function refreshAccessToken(currentToken: string, dispatch: AppDispatch) {
  try {
    const result = await dispatch(refreshToken(currentToken));

    if (refreshToken.fulfilled.match(result)) {
      if (result) {
        scheduleTokenRefresh(result.payload, dispatch); // Lập lại lịch với token mới
      } else {
        console.warn("No token found in sessionStorage after refresh");
        logoutUser();
      }
    } else {
      console.error("Refresh token failed");
      logoutUser();
    }
  } catch (err) {
    console.error("Token refresh failed", err);
    logoutUser(); // clear token và điều hướng về login nếu cần
  }
}