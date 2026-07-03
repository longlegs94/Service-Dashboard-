"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarCheck, Check, Loader2, PartyPopper } from "lucide-react";
import { business } from "@/content/business";
import { services } from "@/content/services";
import { cities } from "@/content/cities";
import { bookingSchema, timeWindows, type BookingInput } from "@/lib/booking-schema";
import { ServiceIcon } from "@/components/ui/service-icon";
import { Button } from "@/components/ui/button";

type FieldErrors = Partial<Record<keyof BookingInput, string>>;

const stepFields: (keyof BookingInput)[][] = [
  ["appliance"],
  ["problem", "preferredDate", "timeWindow"],
  ["name", "phone", "email", "address", "city"],
];

const stepTitles = ["What needs fixing?", "What's it doing?", "Where do we send the technician?"];

const inputClass =
  "w-full rounded-xl border border-ink-300 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink-500 focus:border-brand-500";

function Field({
  label,
  error,
  children,
  optional = false,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2 text-sm font-semibold text-ink-900">
        {label}
        {optional && <span className="text-xs font-normal text-ink-500">optional</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-sm text-red-600">{error}</span>}
    </label>
  );
}

export function BookingWizard() {
  const searchParams = useSearchParams();
  const applianceParam = searchParams.get("appliance") ?? "";
  const problemParam = searchParams.get("problem") ?? "";

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const [form, setForm] = useState<BookingInput>({
    appliance: services.some((s) => s.slug === applianceParam) ? applianceParam : "",
    brand: "",
    problem: problemParam,
    preferredDate: "",
    timeWindow: "" as BookingInput["timeWindow"],
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    company: "",
  });

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const set = <K extends keyof BookingInput>(key: K, value: BookingInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateStep = (index: number): boolean => {
    const fields = stepFields[index];
    const partial = bookingSchema.pick(
      Object.fromEntries(fields.map((f) => [f, true])) as Record<keyof BookingInput, true>,
    );
    const result = partial.safeParse(form);
    if (result.success) {
      setErrors({});
      return true;
    }
    const next: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof BookingInput;
      if (!next[key]) next[key] = issue.message;
    }
    setErrors(next);
    return false;
  };

  const goNext = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const submit = async () => {
    if (!validateStep(2)) return;
    const result = bookingSchema.safeParse(form);
    if (!result.success) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error ?? "Something went wrong. Please call us instead.");
      }
      setReference(json.reference);
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (reference) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-ink-100 bg-white p-10 text-center shadow-lift"
      >
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <PartyPopper className="h-8 w-8" aria-hidden="true" />
        </span>
        <h2 className="mt-6 text-2xl font-bold text-ink-900">Booking request received!</h2>
        <p className="mt-3 text-ink-500">
          Your reference number is{" "}
          <span className="font-mono font-bold text-ink-900">{reference}</span>. We&apos;ll call
          you shortly to confirm your appointment window.
        </p>
        <p className="mt-2 text-sm text-ink-500">
          Need to change something? Call us at{" "}
          <a href={business.phoneHref} className="font-semibold text-brand-700">
            {business.phone}
          </a>{" "}
          and quote your reference.
        </p>
        <div className="mt-8">
          <Button href="/">Back to Home</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-lift">
      {/* Progress */}
      <div className="border-b border-ink-100 bg-ink-50/50 px-6 py-5 sm:px-8">
        <div className="flex items-center gap-2">
          {stepTitles.map((title, i) => (
            <div key={title} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  i < step
                    ? "bg-brand-700 text-white"
                    : i === step
                      ? "bg-accent-500 text-white"
                      : "bg-ink-100 text-ink-500"
                }`}
                aria-current={i === step ? "step" : undefined}
              >
                {i < step ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
              </span>
              {i < stepTitles.length - 1 && (
                <span
                  className={`h-0.5 flex-1 rounded transition-colors ${
                    i < step ? "bg-brand-700" : "bg-ink-100"
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 font-bold text-ink-900">
          Step {step + 1} of 3 — {stepTitles[step]}
        </p>
      </div>

      <div className="p-6 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {step === 0 && (
              <div>
                <div
                  role="radiogroup"
                  aria-label="Choose the appliance that needs repair"
                  className="grid grid-cols-2 gap-3 sm:grid-cols-3"
                >
                  {services.map((service) => {
                    const selected = form.appliance === service.slug;
                    return (
                      <button
                        key={service.slug}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => set("appliance", service.slug)}
                        className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-5 text-center transition-all duration-200 ${
                          selected
                            ? "border-brand-600 bg-brand-50 shadow-soft"
                            : "border-ink-100 bg-white hover:border-brand-300 hover:bg-brand-50/50"
                        }`}
                      >
                        <span className={selected ? "text-brand-700" : "text-ink-500"}>
                          <ServiceIcon icon={service.icon} className="h-8 w-8" />
                        </span>
                        <span className="text-sm font-semibold text-ink-900">
                          {service.shortName}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.appliance && (
                  <p className="mt-3 text-sm text-red-600">{errors.appliance}</p>
                )}

                <div className="mt-6">
                  <Field label="Brand" optional>
                    <input
                      list="brand-options"
                      className={inputClass}
                      placeholder="e.g. Samsung, LG, Whirlpool…"
                      value={form.brand ?? ""}
                      onChange={(e) => set("brand", e.target.value)}
                    />
                    <datalist id="brand-options">
                      {business.brands.map((b) => (
                        <option key={b} value={b} />
                      ))}
                    </datalist>
                  </Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <Field label="Describe the problem" error={errors.problem}>
                  <textarea
                    className={`${inputClass} min-h-28 resize-y`}
                    placeholder="e.g. The washer fills with water but the drum never spins, and it beeps with error code UE…"
                    value={form.problem}
                    onChange={(e) => set("problem", e.target.value)}
                  />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Preferred date" error={errors.preferredDate}>
                    <input
                      type="date"
                      min={minDate}
                      className={inputClass}
                      value={form.preferredDate}
                      onChange={(e) => set("preferredDate", e.target.value)}
                    />
                  </Field>
                  <Field label="Time window" error={errors.timeWindow}>
                    <div className="space-y-2">
                      {timeWindows.map((w) => (
                        <label
                          key={w.value}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-2.5 text-sm transition-colors ${
                            form.timeWindow === w.value
                              ? "border-brand-600 bg-brand-50 font-semibold text-ink-900"
                              : "border-ink-100 text-ink-700 hover:border-brand-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="timeWindow"
                            value={w.value}
                            checked={form.timeWindow === w.value}
                            onChange={() => set("timeWindow", w.value)}
                            className="sr-only"
                          />
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              form.timeWindow === w.value ? "bg-brand-600" : "bg-ink-300"
                            }`}
                            aria-hidden="true"
                          />
                          {w.label}
                        </label>
                      ))}
                    </div>
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" error={errors.name}>
                    <input
                      className={inputClass}
                      autoComplete="name"
                      placeholder="Jane Doe"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </Field>
                  <Field label="Phone" error={errors.phone}>
                    <input
                      type="tel"
                      className={inputClass}
                      autoComplete="tel"
                      placeholder="(604) 555-0123"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Email" error={errors.email}>
                  <input
                    type="email"
                    className={inputClass}
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Street address" error={errors.address}>
                    <input
                      className={inputClass}
                      autoComplete="street-address"
                      placeholder="123 Main St"
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                    />
                  </Field>
                  <Field label="City" error={errors.city}>
                    <input
                      list="city-options"
                      className={inputClass}
                      autoComplete="address-level2"
                      placeholder="Surrey"
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                    />
                    <datalist id="city-options">
                      {cities.map((c) => (
                        <option key={c.slug} value={c.name} />
                      ))}
                    </datalist>
                  </Field>
                </div>
                {/* Honeypot — hidden from real users */}
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                  value={form.company ?? ""}
                  onChange={(e) => set("company", e.target.value)}
                />
                {submitError && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submitError} You can also reach us at{" "}
                    <a href={business.phoneHref} className="font-semibold underline">
                      {business.phone}
                    </a>
                    .
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between gap-4">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
            </button>
          ) : (
            <Link
              href="/diagnose"
              className="text-sm font-medium text-brand-700 underline-offset-4 hover:underline"
            >
              Not sure? Try the AI helper
            </Link>
          )}

          {step < 2 ? (
            <Button onClick={goNext}>
              Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending…
                </>
              ) : (
                <>
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Request Booking
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
