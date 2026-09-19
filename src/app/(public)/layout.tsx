import { Suspense } from "react";
import { PublicLayout } from "@/components/layout/public-layout";
import { DevModeProvider } from "@/components/dev-mode/DevModeProvider";

export default function PublicRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PublicLayout>{children}</PublicLayout>}>
      <DevModeProvider>
        <PublicLayout>{children}</PublicLayout>
      </DevModeProvider>
    </Suspense>
  );
}
