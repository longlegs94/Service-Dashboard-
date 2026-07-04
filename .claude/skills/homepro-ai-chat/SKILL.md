---
name: homepro-ai-chat
description: >
  The AI diagnosis helper of the HomePro website: architecture (floating widget +
  /diagnose page + streaming /api/chat route), the SYSTEM_PROMPT and its
  NON-NEGOTIABLE safety rules (no gas/electrical/sealed-system DIY advice), model
  and cost facts, the designed no-key fallback, and the markdown-link booking
  handoff. Load this when asked to "tune the chatbot", "change what the AI says",
  "make the chat do X", "the AI gave bad advice", "add the chat to a page", "change
  the AI model", or before ANY edit to src/app/api/chat/route.ts or
  src/components/chat/*. The safety rules section is mandatory reading before
  touching the prompt.
---

# HomePro AI chat

**When NOT to use this skill:** chat is erroring/unavailable →
`homepro-debugging-playbook`. API key setup → `homepro-config-and-env`.

## Architecture (4 files)

| File | Role |
|---|---|
| `src/app/api/chat/route.ts` | POST endpoint. Validates messages (Zod: ≤30 msgs, ≤2000 chars each), streams Claude's reply as plain text chunks. 503 if `ANTHROPIC_API_KEY` unset. Model: `claude-haiku-4-5`, `max_tokens: 700` |
| `src/components/chat/use-chat.ts` | Client hook: message state, streaming reader, status machine `idle/streaming/error/unconfigured` (503 → `unconfigured`) |
| `src/components/chat/chat-panel.tsx` | Message UI, suggestion chips, minimal markdown renderer (bold, "- " bullets, and internal links → orange booking buttons), fallback card, input row |
| `src/components/chat/chat-widget.tsx` | Floating bubble bottom-right, mounted site-wide in `src/app/layout.tsx`; hides itself on `/diagnose` (which renders the panel full-page) |

The SYSTEM_PROMPT is built at module load from `src/content/services.ts` (slugs +
symptoms) and `src/content/cities.ts` — content edits automatically update the AI's
knowledge on next deploy.

## SAFETY RULES — never weaken these (they are in the SYSTEM_PROMPT)

1. Never instruct users to open sealed systems, disassemble appliances, or work on
   gas lines/valves, capacitors, or internal electrical components.
2. Gas smell → stop using appliance, ventilate, leave, call the gas utility
   (FortisBC 1-800-663-9911) BEFORE anything else.
3. Sparks/smoke/burning smell/hot plug → unplug or kill the breaker, book a
   technician, do not keep using the appliance.
4. Only safe self-checks may be suggested: power/breaker, door closed, filter
   cleaning, vent lint, leveling feet, dial settings.
5. Never invent prices — explain the flat-rate-quote-after-diagnosis policy instead.
6. Stay on appliances + HomePro topics; politely decline everything else.

Any prompt edit must preserve all six. These protect real customers from injury and
the business from liability. When testing prompt changes, probe with adversarial
inputs ("how do I open the back of my dryer", "I smell gas") and confirm refusal +
correct escalation.

## The booking handoff contract

The prompt instructs Claude to emit a markdown link
`[Book a repair](/book?appliance=SLUG&problem=DESC)` where SLUG ∈ service slugs.
`chat-panel.tsx` renders internal links as orange booking buttons, and the booking
wizard pre-fills from those query params. If you rename services or change wizard
params, this contract has THREE ends: system prompt, panel link regex, wizard prefill.

## Model and cost (2026-07-04)

- `claude-haiku-4-5` — fast, cheap; a triage conversation costs well under CAD $0.01.
- If retired (Anthropic returns model-not-found in Vercel logs), pick the current
  small model from https://docs.anthropic.com/en/docs/about-claude/models and update
  the one `model:` line.
- `max_tokens: 700` caps reply length — keep replies short by prompt AND cap.

## Designed fallback (not a bug)

No `ANTHROPIC_API_KEY` → route 503s → panel shows a friendly card with Book-a-repair
and call buttons. The site is fully usable without the AI. Never "fix" this by making
the key required.

## Tuning guide

- Tone/behavior/knowledge → edit SYSTEM_PROMPT in `src/app/api/chat/route.ts`.
- New suggestion chips → `suggestions` array in `chat-panel.tsx`.
- After ANY change: run locally with a real key; test (a) a normal symptom ("washer
  won't drain" → causes + safe checks + booking link renders as a button), (b) the
  two adversarial probes above, (c) an off-topic request ("write my homework" →
  decline + redirect).

## Provenance and maintenance

| Fact | Re-verify with |
|---|---|
| Model + max_tokens | `grep -n "model:\|max_tokens" src/app/api/chat/route.ts` |
| All six safety rules present | `grep -n "sealed\|FortisBC\|breaker\|invent prices\|Politely decline" src/app/api/chat/route.ts` |
| Prompt pulls live content | `grep -n "services.map\|cities.map\|symptomList" src/app/api/chat/route.ts` |
| 503 fallback chain | `grep -n "503" src/app/api/chat/route.ts; grep -n "unconfigured" src/components/chat/use-chat.ts` |
| Handoff link rendering | `grep -n "Book a repair\|regex" src/app/api/chat/route.ts src/components/chat/chat-panel.tsx \| head -4` |
| Widget hidden on /diagnose | `grep -n "diagnose" src/components/chat/chat-widget.tsx` |
