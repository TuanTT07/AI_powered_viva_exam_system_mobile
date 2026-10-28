# UI states

Public welcome has a single Đăng nhập CTA and decorative vector illustration without exam data. Sign-in has labeled fields, email keyboard/Next/Go, password visibility, input errors and real request pending/errors. Duplicate submission is guarded; no simulated success/loading.

Startup verifies stored authentication. Network/timeout failures offer retry or explicit re-authentication without silently deleting a still-valid token. Invalid/expired sessions are cleared; unsupported mobile roles cannot enter protected features. First-login password change gates access. Backend success is required before clearing the old session and requesting fresh login after password change; uncertain network mutation outcomes are stated explicitly.

Student Lịch thi / Điểm / Hồ sơ use compact shared surfaces, 48dp targets and labeled bottom navigation. Profile comes from BE. Exam/grade empty states refer to the disconnected exam data source, not an unauthenticated account. Lecturer redesign/data integration remain pending. No runtime sample identities, records, transcripts or scores.

Style: web royal blue #2563eb, slate #0f172a, #f8fafc canvas, offline Jakarta font, two-layer surfaces, thin SVG icons and pill actions. Motion uses opacity/transform with custom bezier and reduced-motion support.

ui-test and unit tests are disabled by user instruction. New authentication interactions, native keyboard/secure persistence/expiry, and TalkBack require later device/manual evidence; build output is not a UI test result.
