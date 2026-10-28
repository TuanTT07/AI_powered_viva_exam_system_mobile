# Known issues

- Browser test T4 recovery skipped after budget; loading/empty/error were observed but retry behavior not asserted.
- Initial ADB stall recovered with software rendering. Native student sample, lecturer list/schedule, rotation, search keyboard and schedule → list Back were checked. Native edit/confirmation Back and full large-font/TalkBack checks remain pending.
- No physical-device or TalkBack end-to-end check yet.
- Demo APK uses generated debug signing, not a Play Store release identity.
- No GitHub remote created; mobile exists as an independent local Git repository.

- npm audit reports five high dependency-chain findings in the current Expo SDK template (CLI/code-signing dependencies). No unsafe forced SDK downgrade applied; reassess before production/API release.

## Student update 2026-10-27
- T4 recovery previously skipped is now verified.
- Result page narrow/landscape inspection skipped; result functionality verified separately.
- Student dashboard is mock-only; deployed backend list capability is not assumed.
- Mock room accepts text, no audio capture/AI follow-ups; native font/keyboard/TalkBack coverage remains partial.

## Current state 2026-10-28

Previous sample flows and their reports are historical. All runtime sample data and simulated sessions are removed. API, authentication and real schedule data remain unconfigured; role selection only navigates UI.

## Student visual refresh · 2026-10-28
- Student Lịch thi / Điểm / Hồ sơ and branded entry UI are implemented without runtime samples. Real authentication, populated profile and published grades still require API integration.
- Đăng xuất currently exits the local role selection; there is no real token/session in this milestone.
- Native student navigation, font_scale=2.0 and landscape were checked before the final entry/logo refinement. The emulator was closed during refinement; final APK is rebuilt, but the refreshed entry/icon has not been rechecked on a device. Web preview checks do not establish native coverage.

## Production-style entry
Current root is welcome → sign-in. Authentication transport remains unconfigured, so signed-in student/lecturer screens are intentionally not reachable via the public entry. Form submission does not create a session; profile, grades and schedules still require real integration. Native keyboard/Back behavior of the new sign-in form is not device-verified in this change. UI-test is disabled by user instruction.

## Backend auth · current
Login, /me restoration, role routing, real profile, secure native token storage and password change are now connected. This supersedes earlier auth-unconfigured notes. Schedule/grade data integration is still pending. Backend initially timed out, later returned401 to invalid credentials. Direct browser CORS for localhost:8082 is403; use npm run preview's local proxy. No valid test account was supplied, so successful real-account login, persistent session/device logout and password change have not been verified end-to-end. New Android build is arm64-v8a; no new emulator/physical-device check. Unit tests and ui-test are disabled by user instruction.
