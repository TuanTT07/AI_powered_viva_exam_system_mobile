# Known issues

- Browser test T4 recovery skipped after budget; loading/empty/error were observed but retry behavior not asserted.
- Initial ADB stall recovered with software rendering. Native student sample, lecturer list/schedule, rotation, search keyboard and schedule → list Back were checked. Native edit/confirmation Back and full large-font/TalkBack checks remain pending.
- No physical-device or TalkBack end-to-end check yet.
- Demo APK uses generated debug signing, not a Play Store release identity.
- No GitHub remote created; mobile exists as an independent local Git repository.

- npm audit reports five high dependency-chain findings in the current Expo SDK template (CLI/code-signing dependencies). No unsafe forced SDK downgrade applied; reassess before production/API release.
