# Plan: Lecturer Advanced Filters & Native Android APK Packaging

## Objectives
1. **Hạng mục 2 (Lecturer Advanced Status Filters)**:
   - Allow lecturer to filter candidates and exam slots by real-time status: `ALL` (Tất cả), `READY` (Sẵn sàng / Đã xếp lịch), `IN_PROGRESS` (Đang thi), `COMPLETED` (Hoàn tất), `ABSENT` (Vắng thi).
   - Display dynamic count badges on each status chip.
   - Integrate with student name/code search in Roster tab, and with Upcoming/History tabs in Schedule.
2. **Hạng mục 1 (Native Android APK Packaging)**:
   - Build a production/debug signed standalone APK using Gradle (`cd android && ./gradlew assembleRelease`).
   - Validate APK artifact location, size, and installation readiness.
3. **Validation & Docs**:
   - `npm run typecheck` (0 errors).
   - `npm run build` (web export).
   - Update `ARCHITECTURE.md`, `USER_FLOWS.md`, and `DECISIONS.md`.
   - Commit changes to Git.

## Implementation Details
1. **use-lecturer-overview.ts**:
   - Added `SlotStatusFilter = "ALL" | "READY" | "IN_PROGRESS" | "COMPLETED" | "ABSENT"`.
   - Added `statusFilter`, `setStatusFilter`, and `statusCounts`.
   - Filter `visible` in Schedule tab and `roster` in Roster tab by matching slot status.
   - Reset status filter to `ALL` upon tab switching.
2. **LecturerScheduleScreen.tsx**:
   - Added scrollable status filter chips in both Schedule and Roster tabs with live candidate counts.
   - Added status badge (`labels[entry.slot.status]`) to candidate cards in Roster view.
   - Refined empty state messages to inform user when filter returns no matching candidates.
3. **Native Packaging**:
   - Built standalone Android APK via `./gradlew assembleRelease`.
