import { Suspense } from "react";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginForm } from "@/components/auth/login-form";
import { VerifiedBanner } from "@/components/auth/verified-banner";

export default function LoginPage() {
  return (
    <AuthSplitLayout
      title="Welcome back"
      subtitle="Sign in to your skilloopz account"
    >
      <Suspense fallback={null}>
        <VerifiedBanner />
      </Suspense>
      <LoginForm />
    </AuthSplitLayout>
  );
}
