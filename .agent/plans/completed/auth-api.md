# Connect mobile authentication

## Goal and source
User authorizes real backend login now, superseding UI-only/no-API instructions for authentication only. Backend source on TuanTT07/AI_powered_viva_exam_system_backend main verified: POST /api/auth/login, GET /api/auth/me, POST /api/auth/change-password; shared envelope; Bearer + expiresIn seconds + UserResponse including mustChangePassword. No refresh/logout endpoint. New password 6–100 chars. Public Render API failed to respond within50s at initial inspection.

## Implementation
- HTTPS public base URL from EXPO_PUBLIC_API_BASE_URL, default same deployed BE as web; 60s timeout, no mock fallbacks, no credential logging.
- Validate auth DTO and mobile roles; native token/expiry in Expo SecureStore, web preview sessionStorage only. Restore via /me, preserve session storage on transient restore failure, expire and logout explicitly.
- Route account roles to existing student/lecturer screens; display real student profile; do not imply schedule/grade integration.
- Gate first-login password change; clear old token and require login after change as backend requires. Prevent duplicate submissions and expose pending/errors.
- Final tests only (ui-test disabled): deterministic transport/session boundary tests, typecheck, existing tests, web export; live invalid-login/CORS smoke only if backend responds. No account credentials supplied, no claim of successful real account login until verified.

## Acceptance
No self-selected role or runtime fixtures; no credential/token output; unsupported admin denied; invalid/expired sessions blocked; restore network error recoverable; normal and forced password logout clear storage; profile derived from server. Note native validation/build limits honestly.

## User refinement and verified blocker
User requested no unit tests; newly authored auth tests removed and no further unit runs. Initial direct live invalid-login probe returned401 (backend responds). OPTIONS from http://localhost:8082 returns403: confirmed CORS blocker. Add a loopback-only development preview proxy for the three auth endpoints so web can reach the same BE without changing backend policy. Native continues direct HTTPS. Proxy does not mock or bypass backend authentication.

## Outcome
Auth implementation complete. Final typecheck, web export, preview-server syntax and whitespace checks passed. Live direct and proxied invalid-login calls returned401; CORS blocker handled by local preview proxy. Native arm64-v8a assembleRelease passed. No valid account supplied; successful credential/restore/password-change/device scenarios are explicitly unverified. No further unit/UI-test runs after user disabled them. Retain signed-in schedule/grade disconnected states. No backend mutations to existing accounts were performed.
