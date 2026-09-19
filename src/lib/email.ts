const DEFAULT_FROM = "NEOT <noreply@neot.app>";

export type EmailConfig = {
  enabled: boolean;
  provider: "sendgrid" | "smtp";
  apiKey: string;
  fromEmail: string;
  fromName: string;
};

export async function getEmailConfig(): Promise<EmailConfig> {
  const { prisma } = await import("@/lib/db");
  const settings = await prisma.platformSetting.findMany({ where: { group: "email" } });
  const values: Record<string, string> = {};
  for (const s of settings) values[s.key] = s.value;

  return {
    enabled: values["email_enabled"] === "true",
    provider: (values["email_provider"] as "sendgrid" | "smtp") || "sendgrid",
    apiKey: values["email_api_key"] || "",
    fromEmail: values["email_from_email"] || "",
    fromName: values["email_from_name"] || "",
  };
}

export async function saveEmailConfig(config: Partial<EmailConfig>): Promise<void> {
  const { prisma } = await import("@/lib/db");
  const entries = Object.entries(config).map(([key, value]) => ({
    key: `email_${key.replace(/([A-Z])/g, "_$1").toLowerCase()}`,
    value: String(value),
    group: "email",
  }));

  for (const { key, value, group } of entries) {
    await prisma.platformSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, group },
    });
  }
}

function buildFromAddress(config: EmailConfig): string {
  const name = config.fromName || "NEOT";
  const email = config.fromEmail || "noreply@neot.app";
  return `${name} <${email}>`;
}

async function sendViaSendGrid(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
  from: string,
): Promise<void> {
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from.match(/<(.+)>/)?.[1] || from, name: from.match(/^(.+)</)?.[1]?.trim() || undefined },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status !== 401) {
      console.error("SendGrid error:", res.status, body);
    }
    throw new Error(`SendGrid error: ${res.status} ${body.slice(0, 200)}`);
  }
}

async function sendViaSmtp(
  _config: EmailConfig,
  to: string,
  subject: string,
  html: string,
  from: string,
): Promise<void> {
  console.log(`[SMTP] Would send email to ${to}: ${subject}`);
  console.log(`[SMTP] From: ${from}`);
  console.log(`[SMTP] Body: ${html.slice(0, 100)}...`);
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getEmailConfig();
    if (!config.enabled) {
      return { success: false, error: "Email service is disabled" };
    }

    const from = config.fromEmail ? `${config.fromName || "NEOT"} <${config.fromEmail}>` : DEFAULT_FROM;

    if (config.provider === "sendgrid") {
      if (!config.apiKey) {
        return { success: false, error: "SendGrid API key not configured" };
      }
      await sendViaSendGrid(config.apiKey, to, subject, html, from);
    } else {
      await sendViaSmtp(config, to, subject, html, from);
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("Failed to send email:", message);
    return { success: false, error: message };
  }
}

export async function sendVerificationEmail(email: string, token: string): Promise<{ success: boolean; error?: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const link = `${baseUrl}/api/auth/verify-email?token=${token}`;
  const html = getVerificationHtml(link);
  return sendEmail(email, "Verify your NEOT account", html);
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<{ success: boolean; error?: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const link = `${baseUrl}/reset-password?token=${token}`;
  const html = getPasswordResetHtml(link);
  return sendEmail(email, "Reset your NEOT password", html);
}

export async function sendWelcomeEmail(email: string, name: string | null): Promise<{ success: boolean; error?: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  const html = getWelcomeHtml(name || "there", baseUrl);
  return sendEmail(email, "Welcome to NEOT!", html);
}

function getVerificationHtml(link: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#0a0a0a;color:#e5e5e5;margin:0;padding:0"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px"><table width="480" cellpadding="0" cellspacing="0" style="max-width:480px"><tr><td style="background:#141414;border-radius:12px;padding:32px;border:1px solid #262626"><h1 style="font-size:22px;font-weight:600;margin:0 0 8px;color:#f5f5f5">Verify your email</h1><p style="font-size:14px;line-height:1.6;color:#a3a3a3;margin:0 0 24px">Click the button below to verify your email address and activate your NEOT account.</p><a href="${link}" style="display:inline-block;background:#f5f5f5;color:#0a0a0a;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600">Verify Email</a><p style="font-size:12px;color:#525252;margin:24px 0 0;line-height:1.5">If you didn't create this account, you can safely ignore this email.<br>This link expires in 24 hours.</p></td></tr></table></td></tr></table></body></html>`;
}

function getPasswordResetHtml(link: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#0a0a0a;color:#e5e5e5;margin:0;padding:0"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px"><table width="480" cellpadding="0" cellspacing="0" style="max-width:480px"><tr><td style="background:#141414;border-radius:12px;padding:32px;border:1px solid #262626"><h1 style="font-size:22px;font-weight:600;margin:0 0 8px;color:#f5f5f5">Reset your password</h1><p style="font-size:14px;line-height:1.6;color:#a3a3a3;margin:0 0 24px">Click the button below to reset your NEOT account password. This link is valid for 1 hour.</p><a href="${link}" style="display:inline-block;background:#f5f5f5;color:#0a0a0a;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600">Reset Password</a><p style="font-size:12px;color:#525252;margin:24px 0 0;line-height:1.5">If you didn't request a password reset, you can safely ignore this email.</p></td></tr></table></td></tr></table></body></html>`;
}

function getWelcomeHtml(name: string, baseUrl: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#0a0a0a;color:#e5e5e5;margin:0;padding:0"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px"><table width="480" cellpadding="0" cellspacing="0" style="max-width:480px"><tr><td style="background:#141414;border-radius:12px;padding:32px;border:1px solid #262626"><h1 style="font-size:22px;font-weight:600;margin:0 0 8px;color:#f5f5f5">Welcome, ${name}!</h1><p style="font-size:14px;line-height:1.6;color:#a3a3a3;margin:0 0 24px">You're all set to start learning with NEOT. Explore courses, track your progress, and achieve your goals.</p><a href="${baseUrl}" style="display:inline-block;background:#f5f5f5;color:#0a0a0a;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600">Get Started</a></td></tr></table></td></tr></table></body></html>`;
}
