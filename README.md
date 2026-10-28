# AIVES Mobile

React Native / Expo / TypeScript. Giao diện lịch thi sinh viên và giảng viên. Chưa nối API; không có dữ liệu mẫu hoặc phiên mô phỏng.

## Chạy

```sh
npm ci
npm run android
```

Android Studio: mở `android/`, chạy máy ảo từ Device Manager. `npm run android` tự nhận Android SDK mặc định và JDK 21 trên macOS. Kiểm tra môi trường bằng `npm run android:check`. SDK khác đường dẫn mặc định thì đặt `ANDROID_HOME`.

Web: `npm run web`. Sinh viên có ba tab **Lịch thi · Điểm · Hồ sơ**, bộ lọc Sắp tới/Đã qua và giao diện theo bảng màu web AIVES. Giảng viên có danh sách kỳ thi (chưa thiết kế lại). Khi chưa có nguồn dữ liệu, ứng dụng hiển thị trạng thái chưa kết nối; không tự điền hồ sơ hay điểm. Đổi mật khẩu bị khóa cho tới khi có đăng nhập thật. Chọn vai trò chỉ điều hướng UI, không phải đăng nhập hay phân quyền.

## Build và kiểm tra

```sh
npm run typecheck
npm test
npm run build
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

APK cài thử: `artifacts/AIVES.apk` (debug signing, chưa phát hành store). Không có API, lưu dữ liệu, ghi âm, chấm điểm hoặc thông báo. Không dùng các báo cáo UI cũ làm bằng chứng cho phiên bản hiện tại; báo cáo mới ở `.context/ui-test-report.html`.
