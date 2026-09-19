import { ApplicationForm } from "@/components/marketing/application-form";
import { PublicLayout } from "@/components/layout/public-layout";

export default function ApplyPage() {
  return (
    <PublicLayout>
      <main className="min-h-screen overflow-x-clip bg-[#05060d] text-white">
        <ApplicationForm />
      </main>
    </PublicLayout>
  );
}
