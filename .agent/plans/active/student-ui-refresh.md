# Student mobile UI refresh

## Goal
Student-only UI: Lịch thi → chi tiết ca, Điểm → kết quả đã công bố, Hồ sơ. Keep web AIVES palette; adapt high-end-visual-design soft structuralism/editorial hierarchy to native mobile. No generated data or runtime API calls.

## Decisions and scope
- User narrowed mobile scope on 2026-10-28: students view schedule/grades/profile; lecturers assigned exams/rosters/attendance. This task changes student presentation only.
- Royal blue #2563eb, slate #0f172a, white and #f8fafc canvas match web. Native 48dp controls, readable typography, restrained spacing override web marketing-scale whitespace in the design skill.
- Nested surfaces, Plus Jakarta Sans, thin custom vector icons, floating bottom navigation and reduced-motion-aware transitions.
- Current source has no authenticated identity/API. Keep disconnected states truthful. Profile fields stay absent; password editing cannot pretend to work. Role entry remains an unauthenticated preview entry.

## Steps
1. Add only font/vector dependencies required for native typography/icons.
2. Build student shell, schedule/detail, published results and profile surfaces; keep source through a feature hook.
3. Check typecheck/tests/web export, run ui-test on exported preview, native smoke if emulator available.
4. Update docs with evidence and limits.

## Acceptance
Three tabs work; tab switching/detail Back work; no sample identities/results; no AI score shown as final; safe-area/large text/keyboard navigation usable; lecturer flow not altered.

## Progress
- Repository, student model, UI components and web color tokens inspected.

## User refinement
- Use Đăng xuất for the profile exit action. Redesign the entry/landing screen and replace template/placeholder branding with AIVES sparkle motif, including app icon/favicon.
- User requests checking only after implementation is finished; collect final validation in one stage. The unfinished word “bỏ” was a typo, no removal requested.

## Handoff
Implementation complete for student UI and final entry/branding refinement. Typecheck, 14 model checks and web export pass. Preview F1–F3 pass; F4 partially checked and skipped after interruption. User explicitly stopped ui-test on 2026-10-28; do not restart it. Native refinement verification remains unavailable after emulator was closed. Commit/push requested on the existing branch.
