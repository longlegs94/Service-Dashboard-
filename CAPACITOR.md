# Native Android (Capacitor)

The app ships as an installable **PWA** first — that already works on Android via
Chrome ("Add to Home screen"). When you want a real Play-Store-installable
Android app, Capacitor wraps the same Vite build (`dist/`) in a native shell with
**no code rewrite**.

Capacitor is already configured (`capacitor.config.ts`, deps in `package.json`).
The native `android/` project is **not** committed — you generate it on a machine
with the Android toolchain.

## One-time setup (on your computer)
Requires **Android Studio** + JDK 17.

```bash
npm install
npm run build                 # produces dist/
npx cap add android           # creates the android/ native project
npx cap sync android          # copies the web build + plugins into it
npx cap open android          # opens Android Studio → Run on a device/emulator
```

## After any web change
```bash
npm run build
npx cap sync android
```
(Or use live reload during development: `npx cap run android --livereload --external`.)

## Going to native camera / push later
The web app already works inside the WebView, including job-photo capture (it uses
the standard file/camera input). To use the richer native APIs, add the plugin and
swap only the relevant service module — nothing else changes:

- **Camera:** `npm i @capacitor/camera`, then implement capture in a
  `src/services/camera.ts` and call it from `JobPhotos` behind a platform check.
- **Push:** `npm i @capacitor/push-notifications`, wire tokens to the backend, and
  pair with the `send-reminders` scheduled function (see `supabase/functions/`).
- **Google sign-in:** for native, use `@capacitor/browser` or a native Google
  plugin and call it from `src/services/auth.ts` (the single auth boundary).

## Publishing
In Android Studio: set the app icon/splash, bump `versionCode`/`versionName`, then
**Build → Generate Signed Bundle/APK** to produce an `.aab` for the Play Console.
