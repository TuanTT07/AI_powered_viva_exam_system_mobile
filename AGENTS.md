# AIVES Mobile

Build the Android schedule app for students and lecturers. Apply ponytail full: minimum working code, no speculative layers. UI-first; never call real APIs in this milestone.

## Architecture

- App composes screens. Feature logic stays inside src/features.
- Screens use feature hooks; shared UI/theme must not import features.
- Schedule model is the shared domain for student/lecturer schedule features.
- API integration and production authentication are not configured yet.
- Do not add sample profiles, exams, candidates, results, questions or simulated sessions. Until API integration, show a disconnected empty state. Never claim a save without backend confirmation.
- Input validation, accessibility and error recovery cannot be removed for simplicity.

## Work

Read docs/ARCHITECTURE.md and docs/USER_FLOWS.md. Cross-feature work gets a plan under .agent/plans/active. Record decisions and limitations. Never create empty feature directories for future work.

## Validation

npm run typecheck; npm test; npm run build. Run ui-test on web preview using its three planning rounds and delegated browser checks. Android native behavior requires emulator/device evidence, not browser evidence. Record unavailable checks honestly.

## Current user validation preference

Do not run the ui-test skill unless the user explicitly re-enables it. The user stopped it on 2026-10-28. Group any other necessary checks at the final implementation stage; do not repeatedly test while editing.
