# Architecture

Expo / React Native / TypeScript. App composes features; shared UI/theme never import features. No second state-management library, API cache or mock auth layer.

## Authentication

App calls useAuthSession, which owns startup verification, current session, pending actions, expiry and sign-out. Public screens: auth/AuthEntryScreen → welcome/WelcomeScreen → sign-in/SignInScreen. useSignIn owns form fields and validation. Auth role is supplied by BE, never selected locally.

services/api/client handles HTTPS, timeout/cancellation, auth headers and shared-envelope normalization. auth/auth-api calls only login/me/change-password and validates DTOs using auth-model. session-storage stores token+expiry in native SecureStore; its web-specific adapter uses per-tab sessionStorage. No password or profile is persisted. No token or credentials are logged.

After login or verified /me restoration, App routes STUDENT and LECTURER to their features. mustChangePassword gates both and requires a fresh login after changing password. No refresh/logout endpoint is invented. See AUTH_API.md for contract and recovery semantics.

## Signed-in features

student-schedule is integrated with backend APIs (/api/v1/student/exams, /api/v1/student/exams/{examId}/my-slot, /api/v1/exams); Student grades use /api/v1/student/exams/{attemptId}/results for completed attempts and show course code with the equal-weight average of published question scores normalized to /10; details show each question score and backend feedback. Each published question contributes finalScore / maxScore * 10 before averaging; maxScore must be positive and finalScore within its rubric range. The UI labels the aggregate as average /10, not a raw sum. useStudentOverview owns cancellable grade loading and live slot fetching, pull-to-refresh and local tab/filter/detail state. Lecturer-schedule is integrated with backend APIs (/api/v1/exams, /api/v1/exams/{examId}/schedule, /api/v1/exams/{examId}/monitor, /api/v1/exams/{examId}/schedule/reschedule, /api/v1/exams/{id}/status, /api/lecturers/{lecturerId}/courses, /api/courses/{courseId}/evaluations, /api/question-attempts/{questionAttemptId}/evaluation, markAbsent, resetAttempt); useLecturerOverview owns live data fetching, monitoring metrics, slot rescheduling, exam status transitions, evaluation/grade checking by assigned course, refreshing, local tab/filter/roster/grades/detail state and candidate actions. Root App.tsx composes screens cleanly without legacy shared mock schedule hooks. No runtime exam/profile/grade fixtures or simulated sessions.

## Presentation

components/ui/mobile provides shared type/surfaces/actions/motion; Brand and thin icons are shared. theme/mobile mirrors the web AIVES palette. Medium/bold Jakarta fonts are bundled using specific package subpaths. Entry/keyboard and navigation use native controls and safe areas.

## Preview

npm run preview exports with /backend and serves localhost:8082. The loopback-only Node server proxies the auth and exam endpoints to real BE because deployed CORS currently denies this browser origin. Native builds call BE directly. This dev server is separate from production hosting and does not grant authentication or fabricate results.
