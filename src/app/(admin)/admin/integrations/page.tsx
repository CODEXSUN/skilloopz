import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Key, Webhook, Puzzle, Link, BarChart3, Mail } from "lucide-react";

export default async function AdminIntegrationsPage() {
  const [integrationsSettings, emailSettings, stripeSettings] = await Promise.all([
    prisma.platformSetting.findMany({ where: { group: "integrations" } }),
    prisma.platformSetting.findMany({ where: { group: "email" } }),
    prisma.platformSetting.findMany({ where: { group: "stripe" } }),
  ]);

  const values: Record<string, string> = {};
  for (const s of integrationsSettings) values[s.key] = s.value;
  for (const s of emailSettings) values[s.key] = s.value;
  for (const s of stripeSettings) values[s.key] = s.value;

  const integrations = [
    {
      name: "Stripe",
      description: "Payment processing for course purchases",
      icon: Key,
      status: values["stripe_enabled"] === "true" ? "enabled" : "disabled",
      currency: values["stripe_currency"] ? values["stripe_currency"].toUpperCase() : null,
    },
    {
      name: "Email Service",
      description: "Transactional email (SendGrid / SMTP)",
      icon: Mail,
      status: values["email_enabled"] === "true" ? "enabled" : "disabled",
      provider: values["email_provider"] ?? "sendgrid",
    },
    {
      name: "Webhooks",
      description: "Outbound event notifications to external services",
      icon: Webhook,
      status: values["webhooks_enabled"] ?? "disabled",
      endpoints: parseInt(values["webhook_count"] ?? "0"),
    },
    {
      name: "LMS Import",
      description: "Import content from external LMS platforms",
      icon: Puzzle,
      status: values["lms_import_enabled"] ?? "disabled",
    },
    {
      name: "OAuth Providers",
      description: "Social login and SSO integrations",
      icon: Link,
      status: values["oauth_enabled"] ?? "disabled",
      providers: values["oauth_providers"] ?? "",
    },
    {
      name: "Google Analytics",
      description: "Visitor tracking and analytics",
      icon: BarChart3,
      status: values["analytics_enabled"] ?? "disabled",
      gaId: values["analytics_ga4_id"] ? values["analytics_ga4_id"] : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Third-party integrations and API connections.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <Card key={integration.name}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={integration.status === "enabled" ? "default" : "secondary"}>
                    {integration.status === "enabled" ? "Enabled" : "Disabled"}
                  </Badge>
                  {"apiKey" in integration && integration.apiKey ? (
                    <span className="text-xs text-muted-foreground">{String(integration.apiKey)}</span>
                  ) : null}
                  {"endpoints" in integration && integration.endpoints !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {String(integration.endpoints)} endpoint{integration.endpoints !== 1 ? "s" : ""}
                    </span>
                  )}
                  {"providers" in integration && integration.providers && (
                    <span className="text-xs text-muted-foreground">{String(integration.providers)}</span>
                  )}
                  {"gaId" in integration && integration.gaId && (
                    <span className="text-xs text-muted-foreground">{String(integration.gaId)}</span>
                  )}
                  {"provider" in integration && integration.provider && (
                    <span className="text-xs text-muted-foreground">via {String(integration.provider)}</span>
                  )}
                  {"currency" in integration && integration.currency && (
                    <span className="text-xs text-muted-foreground">{String(integration.currency)}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
