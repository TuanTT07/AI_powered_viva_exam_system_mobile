# AIVES Mobile

Build the Android schedule demo for students and lecturers. Apply ponytail full: minimum working code, no speculative layers. UI-first; never call real APIs in this milestone.

## Architecture

- App composes screens and owns demo-session memory. Feature logic stays inside src/features.
- Screens use feature hooks; shared UI/theme must not import features.
- Schedule model is the shared domain for student/lecturer schedule features.
- No localStorage, SecureStore, networking, or production auth in this demo.
- Demo labels must stay visible. Never present mock changes as server-saved.
- Input validation, accessibility and error recovery cannot be removed for simplicity.

## Work

Read docs/ARCHITECTURE.md and docs/USER_FLOWS.md. Cross-feature work gets a plan under .agent/plans/active. Record decisions and limitations. Never create empty feature directories for future work.

## Validation

npm run typecheck; npm test; npm run build. Run ui-test on web preview using its three planning rounds and delegated browser checks. Android native behavior requires emulator/device evidence, not browser evidence. Record unavailable checks honestly.
