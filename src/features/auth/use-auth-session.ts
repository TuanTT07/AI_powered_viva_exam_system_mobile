import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { ApiError } from "../../services/api/client";
import { authenticate, updatePassword, verifySession } from "./auth-api";
import {
  readStoredAuth,
  type AuthSession,
  type Credentials,
} from "./auth-model";
import { sessionStorage } from "./session-storage";

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [phase, setPhase] = useState<"restoring" | "ready" | "error">(
    "restoring",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const working = useRef(false);
  const request = useRef<AbortController | null>(null);

  const restore = useCallback(async () => {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setPhase("restoring");
    setError("");
    const controller = new AbortController();
    request.current = controller;
    try {
      const raw = await sessionStorage.read();
      if (controller.signal.aborted) return;
      const stored = readStoredAuth(raw);
      if (!stored) {
        if (raw) {
          await sessionStorage.clear();
          setNotice("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        }
        if (!controller.signal.aborted) {
          setSession(null);
          setPhase("ready");
        }
        return;
      }
      try {
        const verified = await verifySession(stored, controller.signal);
        if (verified.expiresAt <= Date.now())
          throw new ApiError("Phiên đăng nhập đã hết hạn.", 401);
        if (!controller.signal.aborted) {
          setSession(verified);
          setPhase("ready");
        }
      } catch (failure) {
        if (controller.signal.aborted) return;
        if (
          failure instanceof ApiError &&
          (failure.status === 401 ||
            failure.status === 403 ||
            failure.code === "INVALID_AUTH")
        ) {
          await sessionStorage.clear();
          setSession(null);
          setPhase("ready");
          setNotice(
            failure.code === "INVALID_AUTH"
              ? failure.message
              : "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          );
        } else throw failure;
      }
    } catch (failure) {
      if (!controller.signal.aborted) {
        setError(
          failure instanceof ApiError
            ? failure.message
            : "Không thể đọc phiên đăng nhập an toàn. Vui lòng thử lại.",
        );
        setPhase("error");
      }
    } finally {
      if (request.current === controller) {
        working.current = false;
        setBusy(false);
      }
    }
  }, []);

  useEffect(() => {
    void restore();
    return () => {
      request.current?.abort();
      working.current = false;
    };
  }, [restore]);

  const signIn = useCallback(async (credentials: Credentials) => {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    const controller = new AbortController();
    request.current = controller;
    try {
      const next = await authenticate(credentials, controller.signal);
      if (controller.signal.aborted) return;
      try {
        await sessionStorage.write(
          JSON.stringify({ token: next.token, expiresAt: next.expiresAt }),
        );
      } catch {
        throw new ApiError(
          "Không thể lưu phiên đăng nhập an toàn trên thiết bị. Vui lòng thử lại.",
        );
      }
      if (!controller.signal.aborted) {
        setSession(next);
        setNotice("");
        setPhase("ready");
      }
    } finally {
      if (request.current === controller) {
        working.current = false;
        setBusy(false);
      }
    }
  }, []);

  const signOut = useCallback(async (message = "") => {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    try {
      await sessionStorage.clear();
      setSession(null);
      setNotice(message);
      setPhase("ready");
    } catch {
      setError(
        "Không thể xóa phiên đăng nhập trên thiết bị. Vui lòng thử lại.",
      );
    } finally {
      working.current = false;
      setBusy(false);
    }
  }, []);

  const expire = useCallback(() => {
    setSession(null);
    setNotice("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    void sessionStorage
      .clear()
      .catch(() =>
        setError("Không thể xóa phiên đã hết hạn. Vui lòng thử lại."),
      );
  }, []);
  useEffect(() => {
    if (!session) return;
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      clearTimeout(timer);
      const remaining = session.expiresAt - Date.now();
      if (remaining <= 0) expire();
      else timer = setTimeout(check, Math.min(remaining, 2_147_483_647));
    };
    check();
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => {
      clearTimeout(timer);
      listener.remove();
    };
  }, [session, expire]);

  const changePassword = async (values: {
    currentPassword: string;
    newPassword: string;
  }) => {
    if (!session || working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    const controller = new AbortController();
    request.current = controller;
    try {
      await updatePassword(session.token, values, controller.signal);
      // Backend requires a fresh JWT after changing password; do not reuse its old claims.
      try {
        await sessionStorage.clear();
      } catch {
        throw new ApiError(
          "Mật khẩu đã được cập nhật nhưng chưa xóa được phiên trên thiết bị. Vui lòng đăng xuất rồi đăng nhập lại.",
        );
      }
      setSession(null);
      setNotice("Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.");
      setPhase("ready");
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) expire();
      throw failure;
    } finally {
      if (request.current === controller) {
        working.current = false;
        setBusy(false);
      }
    }
  };
  return {
    session,
    phase,
    busy,
    error,
    notice,
    restore,
    signIn,
    signOut,
    changePassword,
  };
}
