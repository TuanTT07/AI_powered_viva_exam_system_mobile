# AIVES Mobile

React Native / Expo / TypeScript. Giao diện lịch thi sinh viên và giảng viên. Đã nối API đăng nhập; lịch thi/điểm chưa nối API. Không có dữ liệu mẫu hoặc phiên mô phỏng.

## Chạy

```sh
npm ci
npm run android
```

Android Studio: mở `android/`, chạy máy ảo từ Device Manager. `npm run android` tự nhận Android SDK mặc định và JDK 21 trên macOS. Kiểm tra môi trường bằng `npm run android:check`. SDK khác đường dẫn mặc định thì đặt `ANDROID_HOME`.

Web preview: `npm run preview` → http://localhost:8082 (proxy cục bộ tới BE thật để tránh CORS). `npm run web` dùng Expo dev server và cần origin được BE cho phép. Luồng **Màn chào → Đăng nhập → Sinh viên / Giảng viên** theo vai trò BE. Hồ sơ dùng thông tin thật từ tài khoản. Token native lưu bằng SecureStore; mở lại app xác minh phiên với `/api/auth/me`. Tài khoản bắt buộc đổi mật khẩu được chuyển tới màn đổi mật khẩu, sau đó đăng nhập lại.

Backend mặc định: `https://aives-backend-xxhi.onrender.com`; đổi qua `EXPO_PUBLIC_API_BASE_URL` (xem `.env.example`). Chi tiết phiên và CORS: [docs/AUTH_API.md](docs/AUTH_API.md). Khi thêm SecureStore, cần chạy `npx expo prebuild --platform android --no-install` rồi `npm run android` để build native mới. Web preview cần BE cho phép origin của preview.

## Build và kiểm tra

```sh
npm run typecheck
npm test
npm run build
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

APK cài thử: `artifacts/AIVES.apk` (debug signing, chưa phát hành store). Chỉ API xác thực được tích hợp; không có ghi âm, chấm điểm hoặc thông báo. Không dùng các báo cáo UI cũ làm bằng chứng cho phiên bản hiện tại; báo cáo mới ở `.context/ui-test-report.html`.
