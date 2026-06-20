# Square Edge Functions

Three Supabase Edge Functions power the Square billing integration, plus a
`_shared/` folder with CORS + Square REST helpers.

| Function | Purpose | Invoked by |
| --- | --- | --- |
| `square-create-invoice` | Ensure a Square customer, create + publish a Square invoice, store ids + public URL, mark our invoice `sent`. | App (`sendInvoiceViaSquare`) |
| `square-create-payment-link` | Create a Square hosted Checkout payment link for the invoice total. | App (`createSquarePaymentLink`) |
| `square-webhook` | Receive Square webhooks; verify HMAC; idempotent; record payments and recompute invoice/job status. | Square (configure in dashboard) |

## Secrets

All functions read configuration from environment variables. Set them with the
Supabase CLI (do **not** commit real values):

```bash
supabase secrets set \
  SQUARE_ACCESS_TOKEN=xxx \
  SQUARE_ENVIRONMENT=sandbox \
  SQUARE_LOCATION_ID=xxx \
  SQUARE_WEBHOOK_SIGNATURE_KEY=xxx
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by the
Edge Functions runtime — no need to set them yourself.

- `SQUARE_ACCESS_TOKEN` — access token (sandbox or production) from the Square
  Developer dashboard.
- `SQUARE_ENVIRONMENT` — `sandbox` or `production`. Selects the API base URL
  (`https://connect.squareupsandbox.com` vs `https://connect.squareup.com`).
- `SQUARE_LOCATION_ID` — the Square location to bill from.
- `SQUARE_WEBHOOK_SIGNATURE_KEY` — the webhook signature key (see below). Only
  used by `square-webhook`.
- `SQUARE_WEBHOOK_NOTIFICATION_URL` — **optional.** Override for the public URL
  Square posts to, used in HMAC verification. Defaults to the request URL. Set
  this if the function is fronted by a different public hostname than the one
  the runtime sees.

## Deploy

```bash
supabase functions deploy square-create-invoice
supabase functions deploy square-create-payment-link
supabase functions deploy square-webhook
```

The webhook must accept unauthenticated requests from Square (it does its own
HMAC verification), so deploy it with JWT verification disabled:

```bash
supabase functions deploy square-webhook --no-verify-jwt
```

The two app-invoked functions are called from the browser with the user's JWT,
so leave their default JWT verification on.

## Configure the Square webhook

1. Square Developer dashboard → your application → **Webhooks** →
   **Subscriptions** → add an endpoint.
2. **Notification URL:**
   `https://<your-project-ref>.functions.supabase.co/square-webhook`
3. Subscribe to events: `invoice.payment_made` and `payment.updated`
   (`payment.created` is also handled if you choose to add it).
4. Copy the **Signature Key** shown for the subscription and set it as
   `SQUARE_WEBHOOK_SIGNATURE_KEY` (see Secrets above).
5. If the public URL differs from what the runtime sees, set
   `SQUARE_WEBHOOK_NOTIFICATION_URL` to the exact Notification URL above so the
   HMAC (`notificationUrl + rawBody`) matches.

## Notes

- Money is always integer cents → Square `{ amount, currency }` money objects.
- The webhook is idempotent via the `square_webhook_events.event_id` unique
  constraint and dedupes payments via the `payments.square_payment_id` unique
  index, so Square retries are safe.
- The webhook always returns 2xx for handled/ignored events to stop retries;
  processing errors are logged, not surfaced as 5xx.
