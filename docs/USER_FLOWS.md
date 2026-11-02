# User flows

Welcome → Đăng nhập → real POST /api/auth/login → route by backend STUDENT/LECTURER role. Email/password form supports pending, invalid-input, invalid-credential, timeout/network and unsupported-role feedback. Android Back on sign-in returns to Welcome unless a request is pending. No role-selection bypass.

Account requires password change → gated ChangePasswordScreen → confirmed POST /api/auth/change-password → clear saved session → sign in again for a new JWT. Normal password change is accessible from profile/account actions. No password recovery endpoint is invented.

Startup with saved token → GET /api/auth/me → verified role/user. Expired/invalid token → sign in again. Transient network failure → recoverable verification screen, preserving stored token until retry or explicit re-authentication. Đăng xuất removes saved token; Android Back at feature root leaves/backgrounds the app without signing out.

- Sinh viên: Lịch thi (Sắp tới / Đã qua) → chi tiết ca, mã phòng thi (accessCode), câu hỏi cấp phát; Điểm → chờ hệ thống chấm thi công bố; Hồ sơ → actual user name/code/email, password change and logout. Đã kết nối API backend thật (/api/v1/exams, /api/v1/student/exams/{examId}/my-slot).
- Giảng viên: Lịch coi thi (Sắp tới / Đã qua) → chi tiết ca; Thao tác ghi nhận vắng thi và reset ca thi; Danh sách thi → tìm kiếm thí sinh theo tên/mã; Hồ sơ → môn học phụ trách, actual user name/code/email, password change and logout. Đã kết nối API backend thật (/api/v1/exams, /api/v1/exams/{examId}/schedule, /api/lecturers/{lecturerId}/courses).

Authentication, Giảng viên API và Sinh viên Lịch thi API đã được kết nối với backend thật. Không có bản ghi mẫu hoặc kết quả giả mạo nào sau khi đăng nhập.
