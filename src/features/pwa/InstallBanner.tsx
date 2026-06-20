import { useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/features/pwa/useInstallPrompt";

const DISMISS_KEY = "install-banner-dismissed";

/** A slim, dismissible "install this app" banner shown when the browser offers it. */
export function InstallBanner() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === "1",
  );

  if (!canInstall || dismissed) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="flex items-center gap-3 border-b bg-primary/5 px-4 py-2 text-sm">
      <Download className="h-4 w-4 shrink-0 text-primary" />
      <span className="flex-1">Install Service Dashboard on your device.</span>
      <Button size="sm" onClick={promptInstall}>
        Install
      </Button>
      <button
        aria-label="Dismiss"
        onClick={dismiss}
        className="rounded p-1 hover:bg-accent"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
