// Small Square REST helper shared by the edge functions.
//
// Square's API version is pinned via the Square-Version header. Money values are
// always integer cents (BigInt-safe small ints) with a currency code.

const SQUARE_VERSION = "2024-12-18";

export interface SquareConfig {
  accessToken: string;
  baseUrl: string;
  locationId: string;
}

/** Resolves Square config from edge-function env. Throws if anything's missing. */
export function getSquareConfig(): SquareConfig {
  const accessToken = Deno.env.get("SQUARE_ACCESS_TOKEN");
  const environment = Deno.env.get("SQUARE_ENVIRONMENT") ?? "sandbox";
  const locationId = Deno.env.get("SQUARE_LOCATION_ID");
  if (!accessToken) throw new Error("Missing SQUARE_ACCESS_TOKEN");
  if (!locationId) throw new Error("Missing SQUARE_LOCATION_ID");
  const baseUrl =
    environment === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";
  return { accessToken, baseUrl, locationId };
}

/** Square money object — amount is integer cents. */
export interface SquareMoney {
  amount: number;
  currency: string;
}

/**
 * Calls the Square API and returns parsed JSON. Throws an Error carrying the
 * Square error detail when the response isn't 2xx.
 */
export async function squareFetch<T = unknown>(
  cfg: SquareConfig,
  path: string,
  init: { method: string; body?: unknown },
): Promise<T> {
  const res = await fetch(`${cfg.baseUrl}${path}`, {
    method: init.method,
    headers: {
      "Square-Version": SQUARE_VERSION,
      Authorization: `Bearer ${cfg.accessToken}`,
      "Content-Type": "application/json",
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const detail =
      json?.errors?.map((e: { detail?: string }) => e.detail).join("; ") ??
      res.statusText;
    throw new Error(`Square API ${res.status}: ${detail}`);
  }
  return json as T;
}

/** A simple UUID for Square idempotency keys. */
export function idempotencyKey(): string {
  return crypto.randomUUID();
}
