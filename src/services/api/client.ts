export class ApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 0, code = "") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "https://aives-backend-xxhi.onrender.com"
)
  .trim()
  .replace(/\/+$/, "");

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
};
export async function apiRequest(
  path: string,
  options: Options = {},
  baseUrl = API_BASE_URL,
  timeoutMs = 60_000,
): Promise<unknown> {
  let resolvedBase = baseUrl;
  if (baseUrl.startsWith("/") && typeof window !== "undefined") {
    resolvedBase = new URL(baseUrl, window.location.origin).href.replace(
      /\/+$/,
      "",
    );
  }
  try {
    const url = new URL(resolvedBase);
    const local = ["localhost", "127.0.0.1", "10.0.2.2"].includes(url.hostname);
    if (
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (url.protocol !== "https:" && !(url.protocol === "http:" && local))
    )
      throw new Error();
  } catch {
    throw new ApiError("Địa chỉ máy chủ chưa được cấu hình hợp lệ.");
  }
  const controller = new AbortController();
  const cancel = () => controller.abort();
  if (options.signal?.aborted)
    throw new ApiError("Yêu cầu đã hủy.", 0, "CANCELLED");
  options.signal?.addEventListener("abort", cancel, { once: true });
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    const response = await fetch(`${resolvedBase}${path}`, {
      method: options.method ?? "GET",
      signal: controller.signal,
      credentials: "omit",
      redirect: "error",
      headers: {
        Accept: "application/json",
        ...(options.body === undefined
          ? {}
          : { "Content-Type": "application/json" }),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new ApiError(
        "Máy chủ trả về dữ liệu không hợp lệ.",
        response.status,
      );
    }
    const envelope = payload as {
      success?: unknown;
      status?: unknown;
      data?: unknown;
      message?: unknown;
    } | null;
    if (!response.ok || (envelope && envelope.success === false)) {
      const status =
        response.ok && typeof envelope?.status === "number"
          ? envelope.status
          : response.status;
      const serverMessage =
        typeof envelope?.message === "string" && envelope.message.trim()
          ? envelope.message.trim()
          : undefined;
      const message =
        serverMessage ??
        (status === 401
          ? "Phiên làm việc hết hạn hoặc chưa đăng nhập."
          : status === 403
            ? "Bạn không có quyền thực hiện thao tác này."
            : status === 429
              ? "Bạn đã thử quá nhiều lần. Vui lòng đợi rồi thử lại."
              : status === 428
                ? "Bạn cần đổi mật khẩu trước khi tiếp tục."
                : status >= 500
                  ? "Máy chủ đang gặp sự cố. Vui lòng thử lại sau."
                  : "Yêu cầu không được chấp nhận. Vui lòng kiểm tra thông tin.");
      throw new ApiError(message, status);
    }
    if (
      envelope &&
      typeof envelope === "object" &&
      !Array.isArray(envelope) &&
      "success" in envelope
    ) {
      if (envelope.success !== true || !("data" in envelope))
        throw new ApiError("Phản hồi máy chủ không hợp lệ.", response.status);
      return envelope.data;
    }
    return payload;
  } catch (error) {
    if (options.signal?.aborted)
      throw new ApiError("Yêu cầu đã hủy.", 0, "CANCELLED");
    if (timedOut)
      throw new ApiError(
        "Máy chủ phản hồi chậm. Vui lòng thử lại sau.",
        0,
        "TIMEOUT",
      );
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      "Không thể kết nối máy chủ. Kiểm tra mạng và thử lại.",
      0,
      "NETWORK",
    );
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", cancel);
  }
}
