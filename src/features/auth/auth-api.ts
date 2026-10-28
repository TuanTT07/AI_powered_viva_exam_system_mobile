import { ApiError, apiRequest } from "../../services/api/client.ts";
import {
  parseLogin,
  parseUser,
  type AuthSession,
  type Credentials,
  type StoredAuth,
} from "./auth-model.ts";

export async function authenticate(
  credentials: Credentials,
  signal?: AbortSignal,
): Promise<AuthSession> {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    },
    signal,
  });
  try {
    return parseLogin(data);
  } catch (error) {
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Phản hồi đăng nhập không hợp lệ.",
      0,
      "INVALID_AUTH",
    );
  }
}
export async function verifySession(
  stored: StoredAuth,
  signal?: AbortSignal,
): Promise<AuthSession> {
  const data = await apiRequest("/api/auth/me", {
    token: stored.token,
    signal,
  });
  try {
    return { ...stored, user: parseUser(data) };
  } catch (error) {
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Thông tin tài khoản không hợp lệ.",
      0,
      "INVALID_AUTH",
    );
  }
}
export async function updatePassword(
  token: string,
  values: { currentPassword: string; newPassword: string },
  signal?: AbortSignal,
) {
  try {
    await apiRequest("/api/auth/change-password", {
      method: "POST",
      body: values,
      token,
      signal,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 400)
      throw new ApiError(
        "Không thể đổi mật khẩu. Kiểm tra mật khẩu hiện tại và yêu cầu mật khẩu mới.",
        400,
      );
    if (
      error instanceof ApiError &&
      (error.code === "TIMEOUT" || error.code === "NETWORK")
    ) {
      throw new ApiError(
        "Chưa xác nhận được kết quả đổi mật khẩu. Hãy thử đăng nhập bằng mật khẩu mới trước khi gửi lại.",
        error.status,
        error.code,
      );
    }
    throw error;
  }
}
