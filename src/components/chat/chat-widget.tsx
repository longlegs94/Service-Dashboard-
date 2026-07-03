"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { ChatPanel } from "@/components/chat/chat-panel";

/** Floating AI-diagnosis chat bubble, shown site-wide (hidden on /diagnose). */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === "/diagnose") return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-4 z-50 flex h-[520px] max-h-[calc(100dvh-7rem)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-lift"
            role="dialog"
            aria-label="AI appliance diagnosis chat"
          >
            <div className="flex items-center justify-between bg-brand-700 px-5 py-4 text-white">
              <div>
                <p className="font-semibold">Appliance Helper</p>
                <p className="text-xs text-brand-100">AI-powered diagnosis · free</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-brand-600"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <ChatPanel compact />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-lift transition-colors hover:bg-brand-800"
        aria-label={open ? "Close AI helper" : "Open AI helper — diagnose your appliance"}
      >
        {open ? <X className="h-6 w-6" aria-hidden="true" /> : <MessageCircle className="h-6 w-6" aria-hidden="true" />}
      </motion.button>
    </>
  );
}
