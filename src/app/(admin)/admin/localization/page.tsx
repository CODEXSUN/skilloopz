import { prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

export default async function AdminLocalizationPage() {
  const settings = await prisma.platformSetting.findMany({
    where: { group: "localization" },
  });

  const values: Record<string, string> = {};
  for (const s of settings) {
    values[s.key] = s.value;
  }

  const supportedLocales = values["supported_locales"] ?? "en";
  const localeList = supportedLocales.split(",").map((l) => l.trim());

  const localeLabels: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    ja: "Japanese",
    zh: "Chinese",
    ar: "Arabic",
    hi: "Hindi",
    ko: "Korean",
    nl: "Dutch",
    pl: "Polish",
    sv: "Swedish",
    tr: "Turkish",
  };

  const items = [
    {
      key: "default_locale",
      label: "Default Locale",
      value: values["default_locale"] ?? "en",
      description: "Default language for the platform",
    },
    {
      key: "timezone",
      label: "Timezone",
      value: values["timezone"] ?? "UTC",
      description: "Default timezone for date/time display",
    },
    {
      key: "date_format",
      label: "Date Format",
      value: values["date_format"] ?? "MM/DD/YYYY",
      description: "Date display format",
    },
    {
      key: "currency",
      label: "Currency",
      value: values["currency"] ?? "USD",
      description: "Default currency for pricing",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Localization</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Language, locale, and regional settings.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
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

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Supported Locales</h2>
        <div className="flex flex-wrap gap-2">
          {localeList.map((locale) => (
            <Badge key={locale} variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
              <Globe className="h-3.5 w-3.5" />
              {localeLabels[locale] ?? locale}
              <span className="ml-0.5 text-xs text-muted-foreground">({locale})</span>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
