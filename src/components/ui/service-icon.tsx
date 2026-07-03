import type { Service } from "@/content/services";

type IconKey = Service["icon"];

/** Hand-drawn appliance line icons, consistent 24×24 / 1.8 stroke style. */
const paths: Record<IconKey, React.ReactNode> = {
  fridge: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="2" />
      <line x1="6" y1="9.5" x2="18" y2="9.5" />
      <line x1="9" y1="5.5" x2="9" y2="7" />
      <line x1="9" y1="12.5" x2="9" y2="15.5" />
    </>
  ),
  washer: (
    <>
      <rect x="3.5" y="3" width="17" height="18" rx="2" />
      <circle cx="12" cy="13" r="4.5" />
      <path d="M8.5 13c1.2-1 2.3 1 3.5 0s2.3 1 3.5 0" />
      <circle cx="7" cy="6" r="0.4" fill="currentColor" />
      <circle cx="10" cy="6" r="0.4" fill="currentColor" />
      <line x1="15" y1="6" x2="17.5" y2="6" />
    </>
  ),
  dryer: (
    <>
      <rect x="3.5" y="3" width="17" height="18" rx="2" />
      <circle cx="12" cy="13" r="4.5" />
      <path d="M10 11.5c.8 1 .8 2 0 3M13 11c1 1.3 1 2.7 0 4" />
      <circle cx="7" cy="6" r="0.4" fill="currentColor" />
      <line x1="14" y1="6" x2="17.5" y2="6" />
    </>
  ),
  dishwasher: (
    <>
      <rect x="3.5" y="3" width="17" height="18" rx="2" />
      <line x1="3.5" y1="8" x2="20.5" y2="8" />
      <circle cx="6.5" cy="5.5" r="0.4" fill="currentColor" />
      <line x1="10" y1="5.5" x2="17.5" y2="5.5" />
      <path d="M12 11.5v2M12 13.5c-2 0-3.5 1.4-3.5 3.5M12 13.5c2 0 3.5 1.4 3.5 3.5" />
    </>
  ),
  stove: (
    <>
      <rect x="3.5" y="3" width="17" height="18" rx="2" />
      <line x1="3.5" y1="9" x2="20.5" y2="9" />
      <circle cx="8" cy="6" r="1.4" />
      <circle cx="16" cy="6" r="1.4" />
      <rect x="7" y="12" width="10" height="6" rx="1" />
    </>
  ),
  freezer: (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="2" />
      <line x1="6" y1="13.5" x2="18" y2="13.5" />
      <path d="M12 5v6M9.5 6.5l5 3M14.5 6.5l-5 3" />
      <line x1="9" y1="16.5" x2="9" y2="18.5" />
    </>
  ),
};

export function ServiceIcon({
  icon,
  className = "h-7 w-7",
}: {
  icon: IconKey;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[icon]}
    </svg>
  );
}
