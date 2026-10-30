# Lecturer mobile UI synchronization & refresh

## Goal
Synchronize the lecturer interface (`features/lecturer-schedule`) with the polished student interface (`features/student-schedule`). Provide a consistent mobile presentation adhering to the AIVES design language (Plus Jakarta Sans, royal blue `#2563eb`, slate `#0f172a`, canvas `#f8fafc`, nested surfaces, 48dp touch targets, floating bottom navigation).

## Scope & Decisions
- Role identity: Display authenticated lecturer profile derived from `auth.session.user` (Full name, lecturer code, email).
- Layout:
  - Top header: Shared `Brand` logo + pill badge `GIẢNG VIÊN`.
  - Floating bottom navigation with 3 tabs:
    1. Lịch coi thi (`schedule`, icon: `calendar`) - Ca thi / kỳ thi được phân công phụ trách.
    2. Danh sách thi (`roster`, icon: `score`) - Danh sách thí sinh & ca thi phụ trách.
    3. Hồ sơ (`profile`, icon: `profile`) - Thông tin tài khoản giảng viên, đổi mật khẩu, đăng xuất.
- Schedule/Exam data: Disconnected empty state ("Chưa có dữ liệu lịch coi thi", "Chưa kết nối dữ liệu kỳ thi") without sample data, fake saves, or speculative mock APIs.
- BackHandler: Handle Android hardware Back button (unselect active detail -> return to schedule tab -> exit/background).
- Clean App composition: Remove temporary outer header wrapper from `App.tsx`; pass `user`, `busy`, `slots`, `onChangePassword`, `onExit` directly into `LecturerScheduleScreen`.

## Steps
1. Create `lecturer-model.ts` and `use-lecturer-overview.ts` in `src/features/lecturer-schedule/`.
2. Rewrite `LecturerScheduleScreen.tsx` using `components/ui/mobile`, `Brand`, `Icon`, and the shared design tokens.
3. Update `App.tsx` to render `LecturerScheduleScreen` with symmetrical props and clean layout.
4. Verify with `npm run typecheck` and `npm run build`.
5. Update docs and record state.

## Outcome
- All 5 steps completed.
- TypeScript check (`npm run typecheck`) passed with 0 errors.
- Web export bundle build (`npm run build`) succeeded in 3.2s.
- No unit tests or ui-tests executed, adhering to user's explicit instructions.

## Lecturer API Integration Phase
1. Verified live backend endpoints via OpenAPI/Swagger (`/v3/api-docs`):
   - `GET /api/v1/exams`: Retrieves exams list.
   - `GET /api/v1/exams/{examId}/schedule`: Retrieves candidate schedules.
   - `POST /api/v1/exams/{examId}/attempts/{attemptId}/absent`: Marks student absent.
   - `POST /api/v1/exams/{examId}/attempts/{attemptId}/reset`: Resets attempt to READY.
2. Created `src/features/lecturer-schedule/lecturer-api.ts`.
3. Upgraded `src/services/api/client.ts` to seamlessly handle both ApiResponse envelopes and direct Spring REST DTOs/Pages.
4. Updated `scripts/preview.mjs` to proxy `/api/v1/exams/**` for web preview.
5. Integrated `use-lecturer-overview.ts` with real token, auto-loading, pull-to-refresh, absent marking, and attempt reset.
6. Updated `LecturerScheduleScreen.tsx` with loading indicators, error recovery, action buttons, and live server connection banner.
7. Verification: `npm run typecheck` and `npm run build` both passed cleanly.


