export type AuthUser = {
  id: string;
  userCode: string;
  fullName: string;
  email: string;
  role: "student" | "lecturer";
  mustChangePassword: boolean;
};
export type StoredAuth = { token: string; expiresAt: number };
export type AuthSession = StoredAuth & { user: AuthUser };
export type Credentials = { email: string; password: string };

export function parseUser(value: unknown): AuthUser {
  if (!value || typeof value !== "object")
    throw new Error("Thông tin tài khoản từ máy chủ không hợp lệ.");
  const v = value as Record<string, unknown>;
  if (
    typeof v.id !== "string" ||
    !v.id.trim() ||
    typeof v.fullName !== "string" ||
    !v.fullName.trim() ||
    typeof v.email !== "string" ||
    !v.email.trim()
  )
    throw new Error("Thông tin tài khoản từ máy chủ không hợp lệ.");
  const role = typeof v.roleName === "string" ? v.roleName.toUpperCase() : "";
  if (role === "ADMIN")
    throw new Error(
      "Ứng dụng chỉ dành cho sinh viên và giảng viên. Vui lòng dùng trang quản trị trên web.",
    );
  if (role !== "STUDENT" && role !== "LECTURER")
    throw new Error("Vai trò tài khoản không được hỗ trợ.");
  if (
    v.mustChangePassword !== undefined &&
    typeof v.mustChangePassword !== "boolean"
  )
    throw new Error("Thông tin tài khoản từ máy chủ không hợp lệ.");
  return {
    id: v.id,
    fullName: v.fullName,
    email: v.email,
    userCode: typeof v.userCode === "string" ? v.userCode : "",
    role: role === "STUDENT" ? "student" : "lecturer",
    mustChangePassword: v.mustChangePassword === true,
  };
}
export function parseLogin(value: unknown, now = Date.now()): AuthSession {
  if (!value || typeof value !== "object")
    throw new Error("Phản hồi đăng nhập không hợp lệ.");
  const v = value as Record<string, unknown>;
  if (
    typeof v.accessToken !== "string" ||
    !v.accessToken.trim() ||
    /\s/.test(v.accessToken) ||
    v.tokenType !== "Bearer" ||
    typeof v.expiresIn !== "number" ||
    !Number.isFinite(v.expiresIn) ||
    v.expiresIn <= 0
  )
    throw new Error("Phản hồi đăng nhập không hợp lệ.");
  const expiresAt = now + v.expiresIn * 1000;
  if (!Number.isSafeInteger(expiresAt))
    throw new Error("Thời hạn đăng nhập không hợp lệ.");
  return { token: v.accessToken, expiresAt, user: parseUser(v.user) };
}
export function readStoredAuth(
  value: string | null,
  now = Date.now(),
): StoredAuth | null {
  if (!value) return null;
  try {
    const v = JSON.parse(value);
    return v &&
      typeof v.token === "string" &&
      v.token.trim() &&
      !/\s/.test(v.token) &&
      Number.isSafeInteger(v.expiresAt) &&
      v.expiresAt > now
      ? { token: v.token, expiresAt: v.expiresAt }
      : null;
  } catch {
    return null;
  }
}
