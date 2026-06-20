import type { CapacitorConfig } from "@capacitor/cli";

// Capacitor wraps the built web app (Vite `dist/`) into a native Android shell.
// The same React codebase runs unchanged inside the native WebView; only a few
// service modules (camera/push) get swapped for native plugins when desired.
const config: CapacitorConfig = {
  appId: "com.servicedashboard.app",
  appName: "Service Dashboard",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
