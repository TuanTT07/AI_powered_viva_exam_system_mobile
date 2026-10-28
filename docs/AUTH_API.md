# Mobile authentication

## Contract
Backend: https://aives-backend-xxhi.onrender.com. Configurable via public EXPO_PUBLIC_API_BASE_URL at build/start. Auth source verified against backend main AuthController, LoginResponse, UserResponse, AuthService, ChangePasswordRequest and MustChangePasswordFilter on2026-10-28. Source adds mustChangePassword, which is not documented in the older web contract; mobile handles the new flag and accepts absent flag for older responses.

- POST /api/auth/login: { email, password } → envelope data { accessToken, tokenType: Bearer, expiresIn: seconds, user }.
- GET /api/auth/me: Bearer token → envelope UserResponse.
- POST /api/auth/change-password: Bearer token + { currentPassword, newPassword }; new password6–100chars. Require fresh login after success because old JWT claims remain unchanged.
- No logout/refresh endpoint. Logout removes this client's saved token; it does not revoke issued server JWTs.

Mobile supports STUDENT and LECTURER; ADMIN receives an explicit unsupported-role error before any token is saved. Server authorization remains authoritative.

## Session
Android/iOS use Expo SecureStore for token+expiry only, no password or stored profile. Web preview uses per-tab sessionStorage, not localStorage; browser storage is not equivalent to encrypted native storage. No API/credential logs. DTOs and expiry checked before saving. App restart verifies user with /me; transient network errors keep saved credentials and show retry/re-auth options.401/403/invalid DTO clears the saved session. Expiry is checked with a timer and when the app returns foreground.

First-login mustChangePassword gates signed-in features. On change-password success, discard old token and prompt sign-in again. Storage deletion failure is reported and is not represented as successful logout. Root Android Back leaves/backgrounds the app without logging out; only explicit Đăng xuất clears the session.

## Development

```sh
npm ci
# Optional: copy .env.example to .env and override the public URL.
npx expo prebuild --platform android --no-install
npm run android
```

SecureStore adds a native module; rebuild the Android app instead of loading new JS in an old APK. Native Android requests do not use browser CORS. For web preview, BE CORS_ALLOWED_ORIGINS must include http://localhost:8082 (or the actual Expo web origin). Do not embed server secrets or account passwords in EXPO_PUBLIC variables. HTTPS is required except localhost/Android-emulator local loopback.

Only authentication is integrated. Schedule/grades remain disconnected sources. User identity in Hồ sơ comes from the login or /me response; no sample fallback. Successful real-account login requires a reachable server and valid credentials; neither mocked unit responses nor web export establish that end-to-end result.

## Local web preview

The deployed backend currently returns403 for a browser preflight from localhost:8082. Use `npm run preview`: it exports the web app with `/backend`, serves dist on127.0.0.1:8082 and forwards only login/me/change-password to the real HTTPS backend. No credentials/cookies are logged or forwarded to another destination; authorization is still performed by BE. `AIVES_PREVIEW_BACKEND_URL` changes the proxy's upstream for local development. This loopback preview server is not a production hosting service. Plain `npm run build` retains the direct backend URL for production/native builds; deployed web must configure CORS or its own origin proxy.
