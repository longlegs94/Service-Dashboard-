import * as React from "react";
import { cn } from "@/lib/utils";

/** Simple badge. Pass color classes via className for status-specific colors. */
const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      className,
    )}
    {...props}
  />
));
Badge.displayName = "Badge";

export { Badge };
