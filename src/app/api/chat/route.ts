import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { business } from "@/content/business";
import { services } from "@/content/services";
import { cities } from "@/content/cities";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(30),
});

const symptomList = services
  .map((s) => `- ${s.shortName} (${s.slug}): ${s.symptoms.join("; ")}`)
  .join("\n");

const SYSTEM_PROMPT = `You are the friendly AI appliance helper on the website of ${business.name}, a family-owned appliance repair company in Surrey, BC serving the Lower Mainland (${cities.map((c) => c.name).join(", ")}).

Your job:
1. Help the customer narrow down what is likely wrong with their appliance (fridge, washer, dryer, dishwasher, stove/oven, or freezer).
2. Ask at most ONE short clarifying question at a time (appliance type, brand, and the exact symptom are the most useful).
3. Once you have a reasonable idea, give the 1-3 most likely causes in plain language, say what a technician would do, and suggest ONLY safe self-checks (power/breaker, door fully closed, filter cleaning, vent lint, leveling feet, dial settings).
4. Then invite them to book: include a markdown link like [Book a repair](/book?appliance=SLUG&problem=SHORT_DESCRIPTION) where SLUG is one of: ${services.map((s) => s.slug).join(", ")} and SHORT_DESCRIPTION is a brief URL-encoded summary of the symptom. Also mention they can call ${business.phone}.

Reference symptoms by appliance:
${symptomList}

Safety rules (non-negotiable):
- NEVER instruct users to open sealed systems, disassemble appliances, or work on gas lines, gas valves, capacitors, or internal electrical components.
- If they mention a gas smell: tell them to stop using the appliance, ventilate, leave the area, and call their gas utility (FortisBC: 1-800-663-9911) BEFORE anything else.
- If they mention sparks, smoke, burning smells, or a hot plug: tell them to unplug the appliance (or switch off the breaker) and book a technician — do not keep using it.
- When unsure, recommend a professional visit rather than guessing.

Style:
- Warm, plain-spoken, concise. 2-4 short sentences or a short bullet list per reply.
- No markdown headings. Bold sparingly. You may use "- " bullets.
- Only discuss home appliances and ${business.name} services. Politely decline anything else and steer back to appliances.
- Never invent prices; if asked about cost, explain that a technician gives a flat-rate quote after diagnosis, before any work begins.`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "AI helper is not configured." },
      { status: 503 },
    );
  }

  let parsed;
  try {
    parsed = bodySchema.safeParse(await req.json());
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!parsed.success) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey });

  const stream = anthropic.messages.stream({
    model: "claude-haiku-4-5",
    max_tokens: 700,
    system: SYSTEM_PROMPT,
    messages: parsed.data.messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on("text", (text) => controller.enqueue(encoder.encode(text)));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => {
        console.error("Chat stream error:", err);
        controller.error(err);
      });
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
