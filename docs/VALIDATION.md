# Validation — 2026-10-26

- TypeScript: passed.
- Schedule model: 12 assertions passed (lookup, accent-insensitive search, status/date filter, invalid date/end, overlap, cancelled lock, immutable update and reset).
- Expo web production export: passed.
- Browser ui-test: 11 assigned, 10 passed, 0 failed, 1 skipped (T4 recovery after observing loading/empty/error; budget reached after development reload).
- Browser: 375×812 and 812×375, no overflow, controls >=48px, labelled fields, keyboard Tab/Enter, zero serious/critical axe violations, no runtime errors or API calls.
- Initial moderate web landmark/heading and language findings addressed in source (main role, level-one heading, Vietnamese HTML language); browser suite not repeated.
- Android Gradle assembleRelease: passed. APK includes assets/index.android.bundle; debug signing for demo installation only.
- APK installation and MainActivity launch on Pixel 7 API 36 arm64: passed. Native UI hierarchy confirms entry screen content and role buttons. After restarting with software rendering, native student sample lookup rendered 08:00–08:20 / STT 01; lecturer exam/schedule list rendered; rotation preserved the lecturer schedule; system Back returned schedule → exam list; search field opened the software keyboard and remained visible. Logcat AndroidRuntime/ReactNativeJS error output was empty.

Native edit/confirmation Back transitions, large-font usability and TalkBack remain only partially/unverified. Changing Android system font scale recreates the demo activity and resets in-memory data; it is not persistent. Browser outcomes do not prove native behavior. See the UI report at .context/ui-test-report.html. No production API or user data was accessed.
