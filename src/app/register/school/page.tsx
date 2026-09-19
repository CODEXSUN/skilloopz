import { Metadata } from "next";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SchoolRegisterForm } from "@/components/auth/school-register-form";

export const metadata: Metadata = {
  title: "Register Your School",
  robots: { index: false, follow: false },
};

export default function SchoolRegisterPage() {
  return (
    <AuthSplitLayout
      title="Register your school"
      subtitle="Get started with NEOT for your institution"
    >
      <SchoolRegisterForm />
    </AuthSplitLayout>
  );
}
