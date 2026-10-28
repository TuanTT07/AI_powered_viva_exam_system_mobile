import { useState } from "react";
import { ApiError } from "../../../services/api/client";
import type { Credentials } from "../auth-model";

export function useSignIn(
  onSignIn: (credentials: Credentials) => Promise<void>,
  pending: boolean,
) {
  const [email, setEmailValue] = useState("");
  const [password, setPasswordValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [message, setMessage] = useState("");
  const setEmail = (value: string) => {
    setEmailValue(value);
    setErrors((current) => ({ ...current, email: undefined }));
    setMessage("");
  };
  const setPassword = (value: string) => {
    setPasswordValue(value);
    setErrors((current) => ({ ...current, password: undefined }));
    setMessage("");
  };
  async function submit() {
    if (pending) return;
    const next = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? undefined
        : "Nhập địa chỉ email hợp lệ.",
      password: password.length ? undefined : "Nhập mật khẩu của bạn.",
    };
    setErrors(next);
    setMessage("");
    if (next.email || next.password) return;
    try {
      await onSignIn({ email, password });
    } catch (failure) {
      if (!(failure instanceof ApiError && failure.code === "CANCELLED"))
        setMessage(
          failure instanceof ApiError
            ? failure.message
            : "Không thể đăng nhập. Vui lòng thử lại.",
        );
    }
  }
  return {
    email,
    password,
    showPassword,
    errors,
    message,
    setEmail,
    setPassword,
    setShowPassword,
    submit,
  };
}
