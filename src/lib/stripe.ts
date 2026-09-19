import Stripe from "stripe";
import { prisma } from "@/lib/db";

export type StripeConfig = {
  enabled: boolean;
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  currency: string;
};

export async function getStripeConfig(): Promise<StripeConfig> {
  const settings = await prisma.platformSetting.findMany({ where: { group: "stripe" } });
  const values: Record<string, string> = {};
  for (const s of settings) values[s.key] = s.value;

  return {
    enabled: values["stripe_enabled"] === "true",
    secretKey: values["stripe_secret_key"] || "",
    publishableKey: values["stripe_publishable_key"] || "",
    webhookSecret: values["stripe_webhook_secret"] || "",
    currency: values["stripe_currency"] || "usd",
  };
}

export async function saveStripeConfig(config: Partial<StripeConfig>): Promise<void> {
  const entries = Object.entries(config).map(([key, value]) => ({
    key: `stripe_${key.replace(/([A-Z])/g, "_$1").toLowerCase()}`,
    value: String(value),
    group: "stripe",
  }));

  for (const { key, value, group } of entries) {
    await prisma.platformSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, group },
    });
  }
}

export function getStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, { apiVersion: "2026-04-22.dahlia" });
}

export async function createPaymentIntent(
  config: StripeConfig,
  amount: number,
  metadata: Record<string, string>,
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const stripe = getStripeClient(config.secretKey);

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: config.currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });

  return { clientSecret: intent.client_secret!, paymentIntentId: intent.id };
}

export async function retrievePaymentIntent(
  config: StripeConfig,
  paymentIntentId: string,
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeClient(config.secretKey);
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

export async function handleWebhookEvent(
  config: StripeConfig,
  rawBody: string,
  signature: string,
): Promise<{ type: string; data: Record<string, unknown> }> {
  const stripe = getStripeClient(config.secretKey);

  const event = stripe.webhooks.constructEvent(rawBody, signature, config.webhookSecret);

  return { type: event.type, data: event.data.object as unknown as Record<string, unknown> };
}
