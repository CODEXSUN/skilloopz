import { redirect } from "next/navigation";

import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import SchoolSettingsClient from "./school-settings-client";

export default async function SchoolSettingsPage() {
  const user = await getUser();
  if (!user || !user.schoolId) redirect("/login");

  const school = await prisma.school.findUnique({
    where: { id: user.schoolId },
    include: {
      whiteLabel: true,
    },
  });

  if (!school) redirect("/school");

  return (
    <SchoolSettingsClient
      school={{
        id: school.id,
        name: school.name,
        code: school.code,
        email: school.email,
        phone: school.phone,
        address: school.address,
        city: school.city,
        state: school.state,
        country: school.country ?? "US",
        postalCode: school.postalCode,
        website: school.website,
        tier: school.tier,
      }}
      whiteLabel={school.whiteLabel ? {
        logoUrl: school.whiteLabel.logoUrl,
        faviconUrl: school.whiteLabel.faviconUrl,
        primaryColor: school.whiteLabel.primaryColor,
        secondaryColor: school.whiteLabel.secondaryColor,
        backgroundColor: school.whiteLabel.backgroundColor,
        textColor: school.whiteLabel.textColor,
        fontFamily: school.whiteLabel.fontFamily,
        customCss: school.whiteLabel.customCss,
        welcomeMessage: school.whiteLabel.welcomeMessage,
        footerText: school.whiteLabel.footerText,
        hideBranding: school.whiteLabel.hideBranding,
        customDomain: school.whiteLabel.customDomain,
      } : null}
    />
  );
}
