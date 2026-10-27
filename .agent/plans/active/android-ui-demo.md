# Android UI demo

Goal: student lookup and lecturer schedule/reschedule using mock memory, separate repository.

Implementation: Expo native screens; shared components/theme; pure schedule model and hook; recovery scenarios; Android project and docs.

Validation: typecheck, model checks, web export, ui-test groups (student, lecturer, accessibility), Android release build, emulator if available.

Status: UI implemented and APK built. Typecheck, 12 model checks and web export passed. ui-test: 10 passed, 0 failed, 1 skipped. Pixel 7/API36 created; release installed and native smoke checks completed (see docs/VALIDATION.md). Remaining validation limitations recorded in KNOWN_ISSUES.md; no API connected.
