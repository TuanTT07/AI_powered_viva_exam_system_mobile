# Lecturer Advanced Features & Codebase Cleanup (Items A & D)

## Goal
1. Item A (Lecturer Advanced Features):
   - Monitoring Dashboard: Display real-time progress & statistics (`totalCandidates`, `readyCount`, `inProgressCount`, `completedCount`, `absentCount`, `completionRate`) from `GET /api/v1/exams/{examId}/monitor`.
   - Reschedule Exam Slot: Implement manual reschedule form/modal on mobile calling `PUT /api/v1/exams/{examId}/schedule/reschedule`.
2. Item D (Cleanup):
   - Remove legacy `useSchedule` mock hook and unused `schedule.slots` prop in `App.tsx`.
   - Ensure clean, decoupled architecture.

## Implementation Details
1. **App.tsx Cleanup (Item D)**:
   - Removed `import { useSchedule }` and `const schedule = useSchedule()`.
   - Removed `slots={schedule.slots}` prop from both `StudentScheduleScreen` and `LecturerScheduleScreen`.
   - Both screens now independently manage their data via their feature hooks (`useStudentOverview` and `useLecturerOverview`).
2. **use-lecturer-overview.ts (Item A)**:
   - Added `monitoringData: Record<string, ExamMonitoringDto>`.
   - Fetches monitoring statistics concurrently on load and pull-to-refresh (`GET /api/v1/exams/{examId}/monitor`).
   - Added `handleReschedule(examId, studentId, newStartIso, newEndIso)` calling `rescheduleCandidate` (`PUT /api/v1/exams/{examId}/schedule/reschedule`), updating slot state, and automatically refreshing exam monitoring metrics.
3. **LecturerScheduleScreen.tsx (Item A)**:
   - Added progress bar and statistics dashboard for each exam (completion rate, total candidates, ready, in-progress, completed, absent).
   - Added inline "Đổi lịch ca thi" form in candidate slot detail view with validated date (YYYY-MM-DD), start time (HH:mm), and end time (HH:mm) inputs.
4. **Validation**:
   - `npm run typecheck` passed (0 errors).
   - `npm run build` (`expo export --platform web`) passed.
