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
