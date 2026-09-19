import { prisma } from "@/lib/db";

interface WebhookPayload {
  event: string;
  resource: string;
  resourceId: string;
  userId: string | null;
  details: Record<string, unknown> | null;
  timestamp: string;
}

export async function dispatchWebhooks(payload: WebhookPayload): Promise<void> {
  const webhooks = await prisma.webhook.findMany({
    where: { active: true },
  });

  const matched = webhooks.filter((w) => {
    const events: string[] = JSON.parse(w.events);
    return events.includes(payload.event) || events.includes("*");
  });

  for (const webhook of matched) {
    fire(webhook, payload).catch(() => {
      // logged as last_status
    });
  }
}

async function fire(
  webhook: { id: string; url: string; secret: string | null; timeoutMs: number; retryCount: number },
  payload: WebhookPayload,
): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), webhook.timeoutMs);

  let lastError: string | null = null;

  for (let attempt = 0; attempt <= webhook.retryCount; attempt++) {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "NEOT-Webhook/1.0",
        "X-Webhook-Event": payload.event,
      };

      if (webhook.secret) {
        headers["X-Webhook-Signature"] = webhook.secret;
      }

      const res = await fetch(webhook.url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (res.ok) {
        await prisma.webhook.update({
          where: { id: webhook.id },
          data: { lastStatus: "success", lastSentAt: new Date() },
        });
        return;
      }

      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Unknown error";
    }

    if (attempt < webhook.retryCount) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }

  clearTimeout(timer);

  await prisma.webhook.update({
    where: { id: webhook.id },
    data: { lastStatus: `error: ${lastError ?? "failed"}` },
  });
}
