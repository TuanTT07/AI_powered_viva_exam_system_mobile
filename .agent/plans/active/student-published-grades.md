# Student published grades

Scope: user authorized mobile grades API integration on 2026-11-04.

- [x] Confirm deployed OpenAPI contract: GET /api/v1/student/exams/{attemptId}/results returns StudentResult[].
- [x] Load published results for completed student attempts when opening Grades; cancel obsolete requests.
- [x] Show question score, feedback and publication date; loading, retry and empty states; refresh through existing pull-to-refresh.
- [x] Use existing authenticated client and preview proxy. No dependency or simulated result.
- [x] Final typecheck/build passed. Deployed OpenAPI verified; unauthenticated published-results request returned HTTP 401 with auth error envelope. Authenticated/device verification unavailable.

Decision: use student published-results endpoint, never lecturer evaluation APIs or web local-storage grading fallback. No total or /10 normalization because StudentResult supplies neither aggregate nor maxScore.
Limitations: no authenticated account supplied; Android runtime and authenticated result contents require device/account verification. Existing schedule discovery remains unchanged (50 summaries per request). Unit tests and ui-test remain disabled by user.
