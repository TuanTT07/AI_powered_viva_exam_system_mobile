# Architecture

App → feature screens → schedule model. Features: auth/role-entry, student-schedule, lecturer-schedule. Shared UI/theme do not import features.

Runtime exam and slot sources are empty until API integration. useSchedule rejects writes while disconnected; it never reports a local save as backend success. studentExams requires an explicit authenticated identity and only derives assigned records; there is no default user or seeded history. The mock room, questions and results have been removed.

Role selection is navigation only, not an authorization boundary. Future API work must derive identity from authenticated state and use backend permissions. No API client or second state-management dependency is introduced now.

## Student presentation refresh · 2026-10-28

StudentScheduleScreen composes schedule, published grades and profile views. useStudentOverview owns tab/filter/detail navigation and delegates ownership checks to studentExams. No second state library or router is needed for these three local tabs. Native hardware Back is handled at the feature boundary.

components/ui/mobile holds shared native surfaces/type/motion used by the student flow and entry screen. Brand and thin vector icons live in components/ui. Color tokens live in theme/mobile.ts. Font files are bundled via specific package subpaths (only medium/bold, no runtime font CDN). Dependencies added only for native font and SVG rendering. Authentication/API integration remains separate and is not implied by selecting a role.
