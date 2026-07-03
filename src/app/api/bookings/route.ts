import { Resend } from "resend";
import { business } from "@/content/business";
import { getService } from "@/content/services";
import { bookingSchema } from "@/lib/booking-schema";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { timeWindows } from "@/lib/booking-schema";

export const runtime = "nodejs";

function makeReference(): string {
  // Short human-friendly reference like HP-4F7K2M
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `HP-${code}`;
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(json);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return Response.json(
      { error: issue?.message ?? "Invalid booking details." },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Honeypot filled → pretend success, store nothing.
  if (data.company) {
    return Response.json({ reference: makeReference() });
  }

  const reference = makeReference();
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error("Booking received but Supabase is not configured.");
    return Response.json(
      { error: "Booking system is temporarily unavailable. Please call us." },
      { status: 503 },
    );
  }

  const { error: dbError } = await supabase.from("bookings").insert({
    reference,
    name: data.name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    city: data.city,
    appliance_type: data.appliance,
    brand: data.brand || null,
    problem: data.problem,
    preferred_date: data.preferredDate,
    preferred_time_window: data.timeWindow,
    status: "new",
  });

  if (dbError) {
    console.error("Booking insert failed:", dbError);
    return Response.json(
      { error: "We couldn't save your booking. Please call us instead." },
      { status: 500 },
    );
  }

  // Email notification is best-effort — the DB row is the source of truth.
  const resendKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.BOOKING_NOTIFICATION_EMAIL;
  if (resendKey && notifyEmail) {
    try {
      const resend = new Resend(resendKey);
      const serviceName = getService(data.appliance)?.name ?? data.appliance;
      const windowLabel =
        timeWindows.find((w) => w.value === data.timeWindow)?.label ?? data.timeWindow;
      await resend.emails.send({
        from: "Bookings <onboarding@resend.dev>",
        to: notifyEmail,
        replyTo: data.email,
        subject: `New booking ${reference}: ${serviceName} in ${data.city}`,
        text: [
          `New repair booking from the website`,
          ``,
          `Reference: ${reference}`,
          `Service: ${serviceName}`,
          `Brand: ${data.brand || "Not specified"}`,
          `Problem: ${data.problem}`,
          ``,
          `Preferred date: ${data.preferredDate} (${windowLabel})`,
          ``,
          `Customer: ${data.name}`,
          `Phone: ${data.phone}`,
          `Email: ${data.email}`,
          `Address: ${data.address}, ${data.city}`,
        ].join("\n"),
      });
    } catch (err) {
      console.error("Booking email failed (booking is saved):", err);
    }
  }

  return Response.json({ reference, phone: business.phone });
}
