import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default async function AdminSecurityPage() {
  const settings = await prisma.platformSetting.findMany({
    where: { group: "security" },
  });

  const values: Record<string, string> = {};
  for (const s of settings) {
    values[s.key] = s.value;
  }

  const securityItems = [
    {
      key: "rate_limit_enabled",
      label: "Rate Limiting",
      value: values["rate_limit_enabled"] ?? "enabled",
      description: "Global rate limiting for API requests",
    },
    {
      key: "rate_limit_max",
      label: "Max Requests",
      value: values["rate_limit_max"] ?? "100",
      description: "Maximum requests per minute",
    },
    {
      key: "session_ttl_hours",
      label: "Session TTL",
      value: values["session_ttl_hours"] ?? "168",
      description: "Session expiration time in hours (default: 7 days)",
    },
    {
      key: "password_min_length",
      label: "Min Password Length",
      value: values["password_min_length"] ?? "8",
      description: "Minimum password length requirement",
    },
    {
      key: "password_require_special",
      label: "Special Characters Required",
      value: values["password_require_special"] ?? "true",
      description: "Require special characters in passwords",
    },
    {
      key: "max_login_attempts",
      label: "Max Login Attempts",
      value: values["max_login_attempts"] ?? "5",
      description: "Max failed login attempts before lockout",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Security</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Security configuration and policies.
          </p>
        </div>
        <Link href="/admin/security/scan">
          <Button variant="outline" size="sm">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Run Security Scan
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {securityItems.map((item) => (
          <Card key={item.key}>
            <CardHeader>
              <CardTitle className="text-base">{item.label}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-foreground">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
