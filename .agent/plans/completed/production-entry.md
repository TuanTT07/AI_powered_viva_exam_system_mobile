# Production-style mobile entry

Goal: replace role-preview landing with a branded welcome → sign-in flow, per user choice. Keep web colors and existing feature architecture. User explicitly stopped ui-test; run only final repository checks.

Scope: welcome visual, email/password form, validation, secure entry/show-hide, keyboard/Android Back behavior. No API integration, no fake login/session/role inference. Auth adapter remains unconfigured; valid submit explicitly reports unavailable sign-in instead of opening protected screens. No fabricated recovery endpoint or support contact.

Steps: implement auth entry screen and local hook; switch App unauthenticated entry to this flow; document limits; run typecheck/model checks/web export once at end. Preserve existing student/lecturer screens for later integration. Fix two accidental backtick characters in shared Button that currently break JSX parsing.

Acceptance: no role bypass; welcome CTA reaches labeled sign-in form; invalid fields show errors; valid form cannot create a fake session; password can be revealed; Back returns welcome; scroll/keyboard-safe structure and 48dp controls.

Outcome: welcome/sign-in presentation delivered, role bypass removed, existing signed-in screens retained. Final typecheck, existing model assertions, web export and whitespace check pass. No ui-test or device interaction run; no current auth transport or refreshed APK is claimed. Form ref adjusted to ComponentRef<typeof TextInput> for React Native 0.88.
