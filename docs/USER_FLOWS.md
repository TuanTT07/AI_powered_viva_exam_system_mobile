# User flows

Welcome → Đăng nhập → real POST /api/auth/login → route by backend STUDENT/LECTURER role. Email/password form supports pending, invalid-input, invalid-credential, timeout/network and unsupported-role feedback. Android Back on sign-in returns to Welcome unless a request is pending. No role-selection bypass.

Account requires password change → gated ChangePasswordScreen → confirmed POST /api/auth/change-password → clear saved session → sign in again for a new JWT. Normal password change is accessible from profile/account actions. No password recovery endpoint is invented.

Startup with saved token → GET /api/auth/me → verified role/user. Expired/invalid token → sign in again. Transient network failure → recoverable verification screen, preserving stored token until retry or explicit re-authentication. Đăng xuất removes saved token; Android Back at feature root leaves/backgrounds the app without signing out.

- Sinh viên: Lịch thi (Sắp tới / Đã qua) → chi tiết ca; Điểm → published results; Hồ sơ → actual user name/code/email, password change and logout. No mobile viva session.
- Giảng viên: Lịch coi thi (Sắp tới / Đã qua) → chi tiết ca; Thao tác ghi nhận vắng thi và reset ca thi; Danh sách thi → tìm kiếm thí sinh theo tên/mã; Hồ sơ → actual user name/code/email, password change and logout. Đã kết nối API backend thật (/api/v1/exams, /api/v1/exams/{examId}/schedule).

Authentication và Giảng viên API đã được kết nối với backend thật. Dữ liệu lịch thi của sinh viên vẫn ở trạng thái ngắt kết nối cho đến khi được tích hợp; không có bản ghi mẫu hoặc kết quả giả mạo nào sau khi đăng nhập.
