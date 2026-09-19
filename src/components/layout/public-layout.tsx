import { PublicHeader } from "@/components/layout/public-header";
import { CustomCursor } from "@/components/marketing/custom-cursor";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <PublicHeader />
      <CustomCursor />
      {children}
    </>
  );
}
