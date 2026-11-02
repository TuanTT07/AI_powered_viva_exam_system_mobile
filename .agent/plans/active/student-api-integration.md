# Student API Integration

## Goal
Connect real backend APIs for the student features (`features/student-schedule`):
- Tra cứu lịch thi cá nhân từ backend (`GET /api/v1/exams` + `GET /api/v1/student/exams/{examId}/my-slot?studentId={studentId}`).
- Đồng bộ dữ liệu lịch thi thực tế của sinh viên, khung giờ thi, mã môn, số thứ tự (STT), mã truy cập phòng thi (`accessCode`).
- Hỗ trợ pull-to-refresh (`RefreshControl`), trạng thái tải dữ liệu, thông báo kết nối máy chủ trung thực.

## Backend Endpoints
- `GET /api/v1/exams?size=50&sortBy=startTime&direction=ASC`: Lấy danh sách kỳ thi trong hệ thống.
- `GET /api/v1/student/exams/{examId}/my-slot?studentId={studentId}`: Lấy ca thi cá nhân của sinh viên trong kỳ thi.

## Steps
1. Create `src/features/student-schedule/student-api.ts`.
2. Update `student-model.ts` to support real slot DTO mapping and question/accessCode attributes.
3. Update `use-student-overview.ts` to fetch real student slots with token, support pull-to-refresh, loading & error states.
4. Update `StudentScheduleScreen.tsx` to handle loading, pull-to-refresh, and live slot details.
5. Update `App.tsx` to pass `token={auth.session.token}` to `StudentScheduleScreen`.
6. Run `npm run typecheck` and `npm run build`.
7. Update docs (`ARCHITECTURE.md`, `USER_FLOWS.md`, `DECISIONS.md`).

## Outcome
- All 7 steps completed.
- TypeScript check (`npm run typecheck`) passed with 0 errors.
- Web export bundle build (`npm run build`) succeeded in 708ms.
- Student features are now live connected to the backend API (`/api/v1/exams` and `/api/v1/student/exams/{examId}/my-slot`).
- No unit tests or ui-tests executed, adhering to user's explicit instructions.

