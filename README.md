# AIVES Mobile — Android UI demo

Expo / React Native / TypeScript. Sinh viên tra cứu ca; giảng viên tìm/lọc và đổi ca. **Chỉ dữ liệu demo, không nối API.**

## Chạy

```sh
npm ci
npm run web
npm start
```

Web preview: Expo sẽ in URL local. Android Studio: Device Manager → tạo/chạy Android Virtual Device, sau đó `npm run android`. Máy thật dùng Expo Go tương thích SDK 58 hoặc APK release.

## Android Studio và APK

Native project đã được sinh ở `android/`; mở thư mục này bằng Android Studio. Cấu hình Android SDK và JDK 21. Không chỉnh các giá trị máy cá nhân vào Git.

```sh
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

APK: `android/app/build/outputs/apk/release/app-release.apk`. Bản release demo dùng debug signing của template để cài thử, không dùng để phát hành store. `assembleDebug` cần Metro; `assembleRelease` nhúng JS và chạy độc lập.

## Dùng thử

- Chọn Sinh viên → Dùng mã mẫu → ca 08:00–08:20 ngày 02/11/2026.
- Mã mẫu: `11111111-1111-4111-8111-111111111111`.
- Giảng viên → Java → ca Nguyễn Đức Anh → Đổi ca → nhập `2026-11-02`, `11:00`, `11:20` → xem lại → xác nhận.
- Kịch bản: Có dữ liệu / Đang tải / Trống / Lỗi. Retry trả về dữ liệu.
- Đổi vai trò giữ thay đổi trong cùng phiên. Reload/khởi động lại phục hồi dữ liệu gốc.
- Thời gian: Asia/Ho_Chi_Minh (UTC+7). Không có phòng thi giả, gửi mail, push, đăng nhập thật hay vào Viva.

## Kiểm tra

```sh
npm run typecheck
npm test
npm run build
```

Báo cáo browser: `.context/ui-test-report.html`. Xem docs/VALIDATION.md cho các giới hạn Android và kiểm tra đã thực hiện.

## Terminal Android Studio không tìm thấy emulator

`npm run android` tự thêm Android SDK mặc định và JDK 21 vào môi trường của tiến trình, không cần sửa shell toàn máy. Kiểm tra bằng `npm run android:check`. Nếu có SDK ở đường dẫn khác, đặt `ANDROID_HOME` trước khi chạy. Mở Device Manager và chạy `AIVES_Demo_API36` nếu chưa có thiết bị.
