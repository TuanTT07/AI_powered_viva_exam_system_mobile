# Decisions

- 2026-10-26: Separate local repository AIVES_mobile, Expo SDK 58 + React Native + TypeScript, Android first.
- Demo-first scope: no API, auth tokens, push, Viva, grades or admin.
- Two feature screens share schedule model and hook. Native components, no UI library or navigation dependency for these small demo flows.
- Date/time input uses labelled YYYY-MM-DD / HH:mm fields to keep preview/native behavior aligned; native picker can replace controls after UI review.
- Expo native project is generated for Android Studio. Release demo uses debug signing and is not store-ready.

- 2026-10-27: Student UI moves from UUID lookup to mock assigned list/history; backend list integration remains pending. One sample marker, shortened copy. Native Back belongs to student feature; workspace shell hidden in room. Oral room uses typed demo answers and local slot-duration timer; no simulated recording or grading claims.

- 2026-10-28: User requested removal of all sample data. Removed seeded exams, candidates, profiles, results, questions, simulated session and scenario controls. No API integration implied; runtime shows disconnected lists and rejects writes. Role selection remains UI navigation only. Earlier demo decisions are superseded.

## 2026-10-28 · Narrow mobile scope and student visual refresh
User narrowed student scope to schedule, grades and profile; lecturer scope to assigned exams, rosters and attendance. Exclude mobile viva, exam creation and grading edits. First deliver student UI only. Follow web AIVES palette at an overall level; use high-end-visual-design for typography/nested surfaces/floating bottom navigation, adapted to native 48dp controls and restrained mobile spacing. No runtime sample data. Profile/password UI stays unauthenticated until actual integration.

Profile exit button uses the user-requested label “Đăng xuất”. In this UI-only build it clears the selected role and returns to the branded entry screen; it does not claim to revoke a real server session. Entry, student shell and lecturer header share Brand. Android adaptive icon and favicon use the same sparkle motif. User prefers one final validation stage after edits.

## 2026-10-28 · Public welcome → sign-in
User wants entry to feel like a production app and chose welcome → sign-in. Replace public role cards with email/password UI. Public entry must not grant access based on a self-selected role. Existing protected feature screens are retained but await actual authentication. This is presentation work, not a claim that production auth is implemented; valid submit reports unavailable service and does not create a fake session. No ui-test runs authorized.

## 2026-10-28 · Backend login authorized
Connect login/me/change-password only, superseding earlier no-API auth restriction. Use backend role and mustChangePassword; no local role choice or mock session. Native token/expiry in Expo SecureStore, web in per-tab sessionStorage. No refresh/logout endpoint: remove saved token on logout; require fresh JWT after password change. Invalid/expired session blocks access; transient restore errors remain recoverable. User requested no unit tests; remove newly authored auth tests, do not run further unit or ui-test suites.

Confirmed deployed backend rejects localhost:8082 CORS preflight403. Add npm run preview with a loopback-only, three-endpoint auth proxy to the same real backend, while native app calls HTTPS directly. No backend CORS policy changed.

## 2026-10-30 · Lecturer UI synchronization
User requested synchronizing the Lecturer UI (`features/lecturer-schedule`) on a new branch (`lecturer-ui-refresh`, without `codex/` prefix) to match the polished Student UI presentation.
- Synchronized design system: `Brand`, `Icon`, `components/ui/mobile` (nested surfaces, royal blue `#2563eb`, slate, Plus Jakarta Sans, 48dp controls, floating bottom navigation, and top role badge `GIẢNG VIÊN`).
- Navigation tabs: Lịch coi thi (`schedule`), Danh sách thi (`roster`), and Hồ sơ (`profile`).
- App composition: Removed the temporary outer header wrapper in `App.tsx`; `LecturerScheduleScreen` receives `user`, `busy`, `slots`, `onChangePassword`, `onExit` directly, making root app composition completely symmetric.
- Disconnected empty states: Maintained truthful disconnected states ("Chưa có dữ liệu lịch coi thi", "Chưa kết nối dữ liệu kỳ thi") without sample data or fake mutations.

## 2026-10-30 · Lecturer API integration
User requested connecting real backend APIs for lecturer features.
- Backend contract: `GET /api/v1/exams`, `GET /api/v1/exams/{examId}/schedule`, `POST /api/v1/exams/{examId}/attempts/{attemptId}/absent`, and `POST /api/v1/exams/{examId}/attempts/{attemptId}/reset`.
- Client normalization: Enhanced `client.ts` to unwrap both `ApiResponse` envelopes and direct Spring payloads/Pages/Lists seamlessly.
- Preview proxy: Updated `scripts/preview.mjs` to proxy `/api/v1/exams/**` to real backend for local web preview, while native builds call HTTPS directly.
- Lecturer API service: Added `lecturer-api.ts` mapping backend `ExamResponse` and `CandidateScheduleResponse` to domain models.
- Interactive features: Added live data loading, pull-to-refresh (`RefreshControl`), live status badges, marking absent, and resetting attempts.

## 2026-11-02 · Student API integration
User requested creating a new branch (`student-api-integration`, without `codex/` prefix) and implementing the backend API integration for Student features.
- Backend contract: `GET /api/v1/exams`, `GET /api/v1/student/exams/{examId}/my-slot?studentId={studentId}`.
- Student API service: Created `src/features/student-schedule/student-api.ts` to query student slots across scheduled exams.
- Model & UI updates: Updated `student-model.ts`, `use-student-overview.ts`, and `StudentScheduleScreen.tsx` with live data fetching, pull-to-refresh (`RefreshControl`), access code cards, question attempt lists, and live connection indicators.
- Symmetrical App integration: Passed `token={auth.session.token}` to `StudentScheduleScreen` in `App.tsx`.

## 2026-11-02 · Lecturer Advanced Features & Codebase Cleanup (Items A & D)
User requested creating a new branch (`lecturer-monitoring-reschedule`, without `codex/` prefix) and implementing items A and D:
- **Item A (Lecturer Advanced Features)**:
  - Monitoring Dashboard: Integrated `GET /api/v1/exams/{examId}/monitor`, displaying real-time completion rate bar and breakdown counters (`totalCandidates`, `readyCount`, `inProgressCount`, `completedCount`, `absentCount`).
  - Reschedule Exam Slot: Integrated `PUT /api/v1/exams/{examId}/schedule/reschedule`, adding an inline form in the slot detail view allowing lecturers to adjust candidate date and time with validation and live state synchronization.
- **Item D (Cleanup)**:
  - Cleaned up legacy `useSchedule` mock hook and unused `slots` prop from `App.tsx`.
  - Both `StudentScheduleScreen` and `LecturerScheduleScreen` now cleanly connect to live backend APIs independently.

## 2026-11-02 · Lecturer Advanced Status Filters & Android APK Packaging
User requested implementing advanced status filters for lecturers and packaging the native Android APK:
- **Lecturer Status Filtering**:
  - Added multi-status filtering (`ALL`, `READY`, `IN_PROGRESS`, `COMPLETED`, `ABSENT`) in both Schedule and Roster tabs with live candidate counts.
  - Added candidate status badge to roster cards.
  - Automatically resets status filter to `ALL` upon tab transition.
- **Standalone Android APK Packaging**:
  - Built standalone production/debug-signed Android APK using Gradle (`cd android && ./gradlew assembleRelease`).






## 2026-11-04 — Student grades API
Use deployed GET /api/v1/student/exams/{attemptId}/results for COMPLETED attempts. Display published per-question scores and feedback only; no invented total/maxScore, no lecturer evaluation or local-storage fallback. Grade loading is isolated from schedule loading with cancellation, retry and pull-to-refresh.

## 2026-11-04 — Cleaner student grades presentation
Keep the grades title outside the scrolling list. Use feature-local white cards with a thin border, compact course/exam hierarchy, separate numeric score badges and short Vietnam-time publication dates. Feedback defaults to three lines with an accessible expand/collapse button. Hide the schedule connection footer on Grades; retain loading, retry, empty and refresh behavior. No shared surface or other feature redesign.

## 2026-11-04 — Scores only
User requested grades display only scores. Retain course/exam context and per-question scores; remove feedback, publication date and expand/collapse state from the Grades UI.

## 2026-11-04 — Grade summary and detail
User requested total + course code, opening question scores and short lecturer feedback. Sum published finalScore values in the student hook; explicitly label as total of published scores, since deployed StudentResult has no overall score, maxScore, weights or completeness indicator. One row per exam attempt (never merge attempts by course). Reuse selected attempt/back handling for grade details, distinct from schedule details. Render backend feedback at three lines with full-text expansion; do not generate or rewrite lecturer feedback. No publication dates in UI.
