import { z } from "zod";
import { services } from "@/content/services";

/** Shared validation for the booking form (client) and /api/bookings (server). */
export const bookingSchema = z.object({
  appliance: z.enum(services.map((s) => s.slug) as [string, ...string[]], {
    message: "Please choose an appliance.",
  }),
  brand: z.string().trim().max(60).optional().or(z.literal("")),
  problem: z
    .string()
    .trim()
    .min(10, "Please describe the problem in a few words (at least 10 characters).")
    .max(1500),
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please pick a preferred date."),
  timeWindow: z.enum(["morning", "afternoon", "flexible"], {
    message: "Please pick a time window.",
  }),
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s()+-]{7,20}$/, "Please enter a valid phone number."),
  email: z.email("Please enter a valid email address.").max(200),
  address: z.string().trim().min(5, "Please enter your street address.").max(200),
  city: z.string().trim().min(2, "Please enter your city.").max(60),
  /** Honeypot — real users never fill this. */
  company: z.string().max(0).optional().or(z.literal("")),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const timeWindows = [
  { value: "morning", label: "Morning (9 AM – 12 PM)" },
  { value: "afternoon", label: "Afternoon (12 PM – 5 PM)" },
  { value: "flexible", label: "I'm flexible" },
] as const;
