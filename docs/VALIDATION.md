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

## Student flow — 2026-10-27

- Typecheck, 22 model checks and web export passed. Android assembleRelease passed; updated artifacts/AIVES-demo.apk installed on API36.
- ui-test: T1–T11 passed, no failures. Extra responsive result-view check skipped (published exam detail was checked instead). T4 loading/empty/error recovery now verified.
- Verified dashboard→detail→instructions→room→submit→pending history; released result/comment/answer; hidden unreleased score; answer retention on question navigation and cancelled confirmation; reset; keyboard/axe; narrow and landscape widths; no API calls.
- Native: dashboard, Java detail and consent instructions verified by UI hierarchy. Room and hardware Back exit confirmation verified by screenshot. App-process AndroidRuntime/ReactNativeJS errors empty. UIAutomator dump could not settle during the 1s timer and concurrent dump attempt failed; this was test tooling, not an app-process crash.
- Native full keyboard, result-view responsive, TalkBack and large font need additional checks. New APK remains a local demo with typed answers; no production auth, audio or AI grading.

## Remove sample data — 2026-10-28

Typecheck, 14 boundary/schedule assertions and web export passed. Production web bundle scanned: no previous sample names, IDs, history or sample labels. ui-test: 6 passed, 0 failed, 0 skipped (entry, student tabs, lecturer, reload, responsive/axe, runtime/network). Empty disconnected state confirmed for both roles; no fake API calls or saves.
Android prebuild and assembleRelease succeeded; artifacts/AIVES.apk installed and launched on API36. App display name is AIVES. Legacy sample APK is no longer the delivery artifact.

## Student visual refresh — 2026-10-28

- Final source typecheck, 14 boundary/schedule assertions, web export and diff whitespace check passed.
- Initial student preview: 10 checks, four findings (tab/filter accessibility state, inactive-filter contrast, text-only resize). Findings fixed; targeted regression 4/4 passed. Baseline coverage included schedule/grades/profile navigation, responsive views, keyboard/axe and no API calls.
- After the final entry/logo/Đăng xuất refinement: F1 landing, F2 navigation/logout and F3 text resize/responsive passed. F4 final accessibility/runtime was interrupted: landing/profile axe returned zero violations and disabled-password/entry keyboard checks passed, but remaining keyboard/runtime assertions were not completed. No additional ui-test runs: user explicitly requested stopping this skill.
- Native student navigation/Back, profile scrolling, system font_scale=2.0 and landscape were checked before final branding refinement. The refreshed entry/icon has not been rerun on a native device; no physical-device/TalkBack coverage claimed. Final APK build status is separate from browser checks.
- Current source has no production authentication or API integration. Đăng xuất returns to entry by clearing local role selection.

## Production-style welcome/sign-in — 2026-10-28

Final typecheck, existing 14 boundary/schedule assertions, web export and whitespace check passed after correcting the React Native 0.88 TextInput ref type. Existing model checks do not exercise the new sign-in form. No ui-test, browser automation, native emulator or TalkBack run was performed. Email/password validation, Next/Go keyboard actions, password visibility and Android Back are implemented but not interaction-tested in this change. The web export is updated; the local APK has not been rebuilt for this welcome/sign-in change. Production authentication remains unavailable and no session is fabricated.

## Backend authentication — current implementation · 2026-10-28

- User authorized real auth and later disabled unit testing; newly added auth unit script removed. No further unit/UI-test runs. Typecheck, preview-server syntax check and diff whitespace check pass. Web export succeeds.
- Verified backend source contract, including mustChangePassword and fresh-login-after-password-change. Actual public invalid-login request returned401; browser preflight from localhost:8082 returned403. Loopback preview proxy forwards real auth only; invalid-login through http://localhost:8082/backend/api/auth/login returned401 in0.40s. Static preview returned200. This confirms request reachability/error handling, not successful real-account authentication.
- Android arm64-v8a assembleRelease with SecureStore succeeded. No new emulator, physical-device or TalkBack run. Session restoration/expiry, role routing, actual profile, logout and password change are implemented; successful account login/persistence/change-password against a real account remain unverified because no valid test credentials were provided.
- Schedule/grade APIs remain disconnected. No runtime fake identities, mock auth or sample records were introduced. API documents: docs/AUTH_API.md. The preceding UI-only notes are historical and superseded for authentication.
