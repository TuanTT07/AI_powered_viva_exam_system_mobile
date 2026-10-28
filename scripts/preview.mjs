import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";

// Loopback-only development preview. Android uses the actual HTTPS backend directly.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const target = new URL(
  process.env.AIVES_PREVIEW_BACKEND_URL ??
    "https://aives-backend-xxhi.onrender.com",
);
if (
  target.protocol !== "https:" &&
  !(
    target.protocol === "http:" &&
    ["localhost", "127.0.0.1"].includes(target.hostname)
  )
)
  throw new Error("Preview backend must use HTTPS or local loopback.");
const build = spawnSync(
  process.execPath,
  ["node_modules/expo/bin/cli", "export", "--platform", "web"],
  {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, EXPO_PUBLIC_API_BASE_URL: "/backend" },
  },
);
if (build.status !== 0) process.exit(build.status ?? 1);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
};
function error(res, status, message) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify({ success: false, status, message, data: null }));
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1:8082");
    if (url.pathname.startsWith("/backend/")) {
      const endpoint = url.pathname.slice("/backend".length);
      const allowed = {
        "/api/auth/login": "POST",
        "/api/auth/me": "GET",
        "/api/auth/change-password": "POST",
      };
      if (allowed[endpoint] !== req.method)
        return error(res, 404, "Endpoint unavailable.");
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 16384) return error(res, 413, "Request too large.");
        chunks.push(chunk);
      }
      const headers = { Accept: "application/json" };
      if (req.method === "POST") headers["Content-Type"] = "application/json";
      if (typeof req.headers.authorization === "string")
        headers.Authorization = req.headers.authorization;
      const response = await fetch(new URL(endpoint, target), {
        method: req.method,
        headers,
        redirect: "error",
        signal: AbortSignal.timeout(60_000),
        body: req.method === "POST" ? Buffer.concat(chunks) : undefined,
      });
      res.writeHead(response.status, {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      });
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD")
      return error(res, 405, "Method unavailable.");
    const filename = path.resolve(
      dist,
      "." +
        decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname),
    );
    const relative = path.relative(dist, filename);
    if (relative.startsWith("..") || path.isAbsolute(relative))
      return error(res, 404, "File unavailable.");
    const info = await stat(filename);
    if (!info.isFile()) return error(res, 404, "File unavailable.");
    const content = await readFile(filename);
    res.writeHead(200, {
      "Content-Type":
        mime[path.extname(filename)] ?? "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(req.method === "HEAD" ? undefined : content);
  } catch (failure) {
    if (res.headersSent) {
      res.destroy();
      return;
    }
    if (failure?.code === "ENOENT") return error(res, 404, "File unavailable.");
    error(res, 502, "Không thể kết nối máy chủ. Vui lòng thử lại.");
  }
});
server.on("error", () => {
  console.error(
    "Không thể mở preview trên cổng8082. Hãy đóng server đang sử dụng cổng này.",
  );
  process.exit(1);
});
server.listen(8082, "127.0.0.1", () =>
  console.log("AIVES preview: http://localhost:8082"),
);
