# Decisions

- 2026-10-26: Separate local repository AIVES_mobile, Expo SDK 58 + React Native + TypeScript, Android first.
- Demo-first scope: no API, auth tokens, push, Viva, grades or admin.
- Two feature screens share schedule model and hook. Native components, no UI library or navigation dependency for these small demo flows.
- Date/time input uses labelled YYYY-MM-DD / HH:mm fields to keep preview/native behavior aligned; native picker can replace controls after UI review.
- Expo native project is generated for Android Studio. Release demo uses debug signing and is not store-ready.
