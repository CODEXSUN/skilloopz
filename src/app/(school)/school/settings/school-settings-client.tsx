"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Palette, Building2, Globe, Image } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const easing = [0.16, 1, 0.3, 1] as const;

interface SchoolSettingsPageProps {
  school: {
    id: string;
    name: string;
    code: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string;
    postalCode: string | null;
    website: string | null;
    tier: string;
  };
  whiteLabel: {
    logoUrl: string | null;
    faviconUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string | null;
    customCss: string | null;
    welcomeMessage: string | null;
    footerText: string | null;
    hideBranding: boolean;
    customDomain: string | null;
  } | null;
}

export default function SchoolSettingsClient({ school, whiteLabel }: SchoolSettingsPageProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: school.name,
    email: school.email ?? "",
    phone: school.phone ?? "",
    address: school.address ?? "",
    city: school.city ?? "",
    state: school.state ?? "",
    country: school.country,
    postalCode: school.postalCode ?? "",
    website: school.website ?? "",
  });

  const [branding, setBranding] = useState({
    logoUrl: whiteLabel?.logoUrl ?? "",
    faviconUrl: whiteLabel?.faviconUrl ?? "",
    primaryColor: whiteLabel?.primaryColor ?? "#3b82f6",
    secondaryColor: whiteLabel?.secondaryColor ?? "#8b5cf6",
    backgroundColor: whiteLabel?.backgroundColor ?? "#ffffff",
    textColor: whiteLabel?.textColor ?? "#111827",
    fontFamily: whiteLabel?.fontFamily ?? "",
    customCss: whiteLabel?.customCss ?? "",
    welcomeMessage: whiteLabel?.welcomeMessage ?? "",
    footerText: whiteLabel?.footerText ?? "",
    hideBranding: whiteLabel?.hideBranding ?? false,
    customDomain: whiteLabel?.customDomain ?? "",
  });

  async function handleSave(tab: "profile" | "branding") {
    setSaving(true);
    setSaved(false);

    try {
      const endpoint = tab === "profile" ? "/api/school/settings" : "/api/school/white-label";
      const body = tab === "profile" ? profile : branding;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Failed to save settings");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          School Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your school profile and branding.
        </p>
      </motion.div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400"
        >
          Settings saved successfully.
        </motion.div>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <Building2 className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>School Profile</CardTitle>
              <CardDescription>Basic information about your school.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">School Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">School Code</Label>
                  <Input id="code" value={school.code} disabled />
                  <p className="text-xs text-muted-foreground">Cannot be changed</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={profile.postalCode}
                    onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("profile")} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>White-Label Branding</CardTitle>
              <CardDescription>Customize the look and feel for your school.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-medium text-foreground">Colors</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="w-16 p-1"
                      />
                      <Input
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                        className="w-16 p-1"
                      />
                      <Input
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background</Label>
                    <div className="flex gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={branding.backgroundColor}
                        onChange={(e) => setBranding({ ...branding, backgroundColor: e.target.value })}
                        className="w-16 p-1"
                      />
                      <Input
                        value={branding.backgroundColor}
                        onChange={(e) => setBranding({ ...branding, backgroundColor: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="textColor">Text</Label>
                    <div className="flex gap-2">
                      <Input
                        id="textColor"
                        type="color"
                        value={branding.textColor}
                        onChange={(e) => setBranding({ ...branding, textColor: e.target.value })}
                        className="w-16 p-1"
                      />
                      <Input
                        value={branding.textColor}
                        onChange={(e) => setBranding({ ...branding, textColor: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-medium text-foreground">Logos</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <div className="flex gap-2">
                      <Image className="mt-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="logoUrl"
                        type="url"
                        value={branding.logoUrl}
                        onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faviconUrl">Favicon URL</Label>
                    <div className="flex gap-2">
                      <Image className="mt-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="faviconUrl"
                        type="url"
                        value={branding.faviconUrl}
                        onChange={(e) => setBranding({ ...branding, faviconUrl: e.target.value })}
                        placeholder="https://example.com/favicon.ico"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Input
                  id="fontFamily"
                  value={branding.fontFamily}
                  onChange={(e) => setBranding({ ...branding, fontFamily: e.target.value })}
                  placeholder="Inter, system-ui, sans-serif"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  value={branding.welcomeMessage}
                  onChange={(e) => setBranding({ ...branding, welcomeMessage: e.target.value })}
                  placeholder="Welcome to our school portal..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerText">Footer Text</Label>
                <Input
                  id="footerText"
                  value={branding.footerText}
                  onChange={(e) => setBranding({ ...branding, footerText: e.target.value })}
                  placeholder="© 2026 My School. All rights reserved."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customCss">Custom CSS</Label>
                <Textarea
                  id="customCss"
                  value={branding.customCss}
                  onChange={(e) => setBranding({ ...branding, customCss: e.target.value })}
                  placeholder="/* Custom styles */"
                  rows={6}
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customDomain">Custom Domain</Label>
                <div className="flex gap-2">
                  <Globe className="mt-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customDomain"
                    value={branding.customDomain}
                    onChange={(e) => setBranding({ ...branding, customDomain: e.target.value })}
                    placeholder="school.neot.app"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label htmlFor="hideBranding">Hide NEOT Branding</Label>
                  <p className="text-xs text-muted-foreground">
                    Remove &quot;Powered by NEOT&quot; from the footer.
                  </p>
                </div>
                <Switch
                  id="hideBranding"
                  checked={branding.hideBranding}
                  onCheckedChange={(checked) => setBranding({ ...branding, hideBranding: checked })}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => handleSave("branding")} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Branding"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
