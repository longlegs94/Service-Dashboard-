"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CalendarCheck, Phone, RotateCcw, Send, Sparkles } from "lucide-react";
import { business } from "@/content/business";
import { useChat } from "@/components/chat/use-chat";

const suggestions = [
  "My fridge isn't cooling",
  "Washer won't drain",
  "Dryer runs but no heat",
  "Dishwasher leaves dishes dirty",
];

/**
 * Renders assistant text with minimal markdown support:
 * **bold**, bullet lines starting with "- ", and [label](/book?...) links
 * (internal links become booking buttons).
 */
function renderAssistantText(text: string): ReactNode[] {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const parts: ReactNode[] = [];
    const regex = /\[([^\]]+)\]\((\/[^)\s]*)\)|\*\*([^*]+)\*\*/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(line)) !== null) {
      if (m.index > last) parts.push(line.slice(last, m.index));
      if (m[1] && m[2]) {
        parts.push(
          <Link
            key={`${i}-${m.index}`}
            href={m[2]}
            className="my-1 inline-flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-accent-600"
          >
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            {m[1]}
          </Link>,
        );
      } else if (m[3]) {
        parts.push(<strong key={`${i}-${m.index}`}>{m[3]}</strong>);
      }
      last = m.index + m[0].length;
    }
    if (last < line.length) parts.push(line.slice(last));

    const isBullet = line.trimStart().startsWith("- ");
    return (
      <span key={i} className={`block ${isBullet ? "pl-3" : ""} ${line === "" ? "h-2" : ""}`}>
        {parts}
      </span>
    );
  });
}

export function ChatPanel({ compact = false }: { compact?: boolean }) {
  const { messages, status, send, reset } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
    setInput("");
  };

  const empty = messages.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {empty && (
          <div className={`flex flex-col items-center text-center ${compact ? "pt-4" : "pt-10"}`}>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="mt-4 font-semibold text-ink-900">
              Tell me what your appliance is doing
            </p>
            <p className="mt-1 max-w-xs text-sm text-ink-500">
              I&apos;ll help you figure out what&apos;s likely wrong and whether it needs a
              technician.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-ink-300 bg-white px-3.5 py-2 text-sm text-ink-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "rounded-br-md bg-brand-700 text-white"
                  : "rounded-bl-md bg-ink-100 text-ink-900"
              }`}
            >
              {msg.role === "assistant" ? (
                msg.content === "" && status === "streaming" ? (
                  <span className="inline-flex gap-1 py-1" aria-label="Assistant is typing">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-500 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-500 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-500 [animation-delay:300ms]" />
                  </span>
                ) : (
                  renderAssistantText(msg.content)
                )
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {status === "unconfigured" && (
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-ink-700">
            <p className="font-semibold text-ink-900">The AI helper isn&apos;t available right now.</p>
            <p className="mt-1">
              No problem — our real experts are one call away, or book online in under a minute.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/book"
                className="inline-flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-2 font-semibold text-white hover:bg-accent-600"
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" /> Book a repair
              </Link>
              <a
                href={business.phoneHref}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-300 bg-white px-4 py-2 font-semibold text-ink-900 hover:border-brand-400"
              >
                <Phone className="h-4 w-4" aria-hidden="true" /> {business.phone}
              </a>
            </div>
          </div>
        )}

        {status === "error" && (
          <p className="text-center text-sm text-ink-500">
            Something went wrong — please try again, or call us at{" "}
            <a href={business.phoneHref} className="font-semibold text-brand-700">
              {business.phone}
            </a>
            .
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="border-t border-ink-100 p-3">
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
              aria-label="Start over"
              title="Start over"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the problem…"
            aria-label="Describe your appliance problem"
            className="h-11 flex-1 rounded-full border border-ink-300 bg-white px-4 text-sm outline-none transition-colors placeholder:text-ink-500 focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={status === "streaming" || input.trim() === ""}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white transition-all hover:bg-brand-800 disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-ink-500">
          AI suggestions are informational only — never open sealed or gas appliances yourself.
        </p>
      </form>
    </div>
  );
}
