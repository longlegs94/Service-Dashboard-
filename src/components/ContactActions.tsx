import { MapPin, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * One-tap field actions. On a phone these open the dialer, the messaging app,
 * and maps directions respectively. Each button only renders when its data
 * exists. `size="sm"` keeps them compact in cards.
 */
export function ContactActions({
  phone,
  address,
  className,
}: {
  phone?: string | null;
  address?: string | null;
  className?: string;
}) {
  if (!phone && !address) return null;
  const trimmedAddress = address?.trim();

  return (
    <div className={className ?? "flex flex-wrap gap-2"}>
      {phone && (
        <>
          <Button variant="outline" size="sm" asChild>
            <a href={`tel:${phone}`}>
              <Phone className="h-4 w-4" />
              Call
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`sms:${phone}`}>
              <MessageSquare className="h-4 w-4" />
              Text
            </a>
          </Button>
        </>
      )}
      {trimmedAddress && (
        <Button variant="outline" size="sm" asChild>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              trimmedAddress,
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            <MapPin className="h-4 w-4" />
            Directions
          </a>
        </Button>
      )}
    </div>
  );
}
