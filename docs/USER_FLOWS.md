# User flows

Welcome → Đăng nhập → real POST /api/auth/login → route by backend STUDENT/LECTURER role. Email/password form supports pending, invalid-input, invalid-credential, timeout/network and unsupported-role feedback. Android Back on sign-in returns to Welcome unless a request is pending. No role-selection bypass.

Account requires password change → gated ChangePasswordScreen → confirmed POST /api/auth/change-password → clear saved session → sign in again for a new JWT. Normal password change is accessible from profile/account actions. No password recovery endpoint is invented.

Startup with saved token → GET /api/auth/me → verified role/user. Expired/invalid token → sign in again. Transient network failure → recoverable verification screen, preserving stored token until retry or explicit re-authentication. Đăng xuất removes saved token; Android Back at feature root leaves/backgrounds the app without signing out.

- Sinh viên: Lịch thi (Sắp tới / Đã qua) → chi tiết ca; Điểm → published results; Hồ sơ → actual user name/code/email, password change and logout. No mobile viva session.
- Giảng viên: existing assigned-exam presentation; full assigned exams/roster/attendance redesign remains pending. Header displays the authenticated user's identity.

Only authentication is integrated. Schedule/grade sources remain disconnected; no sample records or fabricated results appear after login. Successful real-account, device persistence and password-change verification need valid test credentials/device evidence; source/build checks alone do not establish those outcomes.
