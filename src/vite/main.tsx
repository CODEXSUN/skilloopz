import { StrictMode, Suspense, lazy, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/public-layout";
import { marketingPrograms, getMarketingProgram } from "@/lib/programs/catalog";
import "./fonts.css";
import "./globals.css";

const LandingPage = lazy(() => import("@/components/marketing/landing-page").then((module) => ({ default: module.LandingPage })));
const AboutContent = lazy(() => import("@/components/about/about-content").then((module) => ({ default: module.AboutContent })));
const FeaturesContent = lazy(() => import("@/components/features/features-content").then((module) => ({ default: module.FeaturesContent })));
const PricingContent = lazy(() => import("@/components/pricing/pricing-content").then((module) => ({ default: module.PricingContent })));
const ApplicationForm = lazy(() => import("@/components/marketing/application-form").then((module) => ({ default: module.ApplicationForm })));
const ProgramDetailPage = lazy(() => import("@/components/programs/program-detail-page").then((module) => ({ default: module.ProgramDetailPage })));
const ProgramsIndex = lazy(() => import("@/components/programs/programs-index").then((module) => ({ default: module.ProgramsIndex })));
const LoginPage = lazy(() => import("./pages/login"));
const CatalogPage = lazy(() => import("./pages/learning").then((module) => ({ default: module.CatalogPage })));
const CoursePage = lazy(() => import("./pages/learning").then((module) => ({ default: module.CoursePage })));
const OnboardingPage = lazy(() => import("./pages/learning").then((module) => ({ default: module.OnboardingPage })));
const LearnerPage = lazy(() => import("./pages/learning").then((module) => ({ default: module.LearnerPage })));
const queryClient = new QueryClient();

const pageTitles: Record<string, string> = {
  "/": "skilloopz | Learn. Practice. Get Placed.",
  "/about": "About | skilloopz",
  "/features": "Features | skilloopz",
  "/pricing": "Pricing | skilloopz",
  "/programs": "Career Programs | skilloopz",
  "/apply": "Apply | skilloopz",
  "/login": "Login | skilloopz",
};

function PublicPage({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}

function ProgramPage() {
  const { slug } = useParams();
  const program = slug ? getMarketingProgram(slug) : undefined;
  if (!program) return <PublicPage><main className="min-h-screen px-6 pt-36">Program not found.</main></PublicPage>;
  const relatedPrograms = marketingPrograms
    .filter((candidate) => candidate.slug !== slug)
    .sort((left, right) => Number(right.category === program.category) - Number(left.category === program.category))
    .slice(0, 3);
  return <PublicPage><ProgramDetailPage program={program} relatedPrograms={relatedPrograms} /></PublicPage>;
}

function App() {
  const location = useLocation();

  useEffect(() => {
    const mode = localStorage.getItem("neot-theme-mode");
    document.documentElement.classList.toggle("dark", mode !== "light");
  }, []);

  useEffect(() => {
    const program = location.pathname.startsWith("/programs/")
      ? getMarketingProgram(location.pathname.slice("/programs/".length))
      : undefined;
    document.title = program
      ? `${program.title} | skilloopz`
      : pageTitles[location.pathname] ?? "skilloopz | Learn. Practice. Get Placed.";
    if (!location.hash) {
      window.scrollTo(0, 0);
      return;
    }

    const scrollToHash = () => {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!target) return false;
      target.scrollIntoView({ behavior: "instant" });
      return true;
    };
    if (scrollToHash()) return;
    const observer = new MutationObserver(() => {
      if (scrollToHash()) observer.disconnect();
    });
    observer.observe(document.getElementById("root")!, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname, location.hash]);

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05060d]" />}>
    <Routes>
      <Route path="/" element={<PublicPage><LandingPage /></PublicPage>} />
      <Route path="/about" element={<PublicPage><AboutContent /></PublicPage>} />
      <Route path="/features" element={<PublicPage><FeaturesContent /></PublicPage>} />
      <Route path="/pricing" element={<PublicPage><PricingContent /></PublicPage>} />
      <Route path="/programs" element={<PublicPage><ProgramsIndex /></PublicPage>} />
      <Route path="/programs/:slug" element={<ProgramPage />} />
      <Route path="/apply" element={<PublicPage><main className="min-h-screen overflow-x-clip bg-[#05060d] text-white"><ApplicationForm /></main></PublicPage>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/courses" element={<CatalogPage />} />
      <Route path="/courses/:courseId" element={<CoursePage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/dashboard" element={<LearnerPage />} />
      <Route path="/dashboard/courses" element={<LearnerPage />} />
      <Route path="/signup" element={<Navigate to="/apply" replace />} />
      <Route path="*" element={<PublicPage><main className="min-h-screen px-6 pt-36">Page not found.</main></PublicPage>} />
    </Routes>
    </Suspense>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode><QueryClientProvider client={queryClient}><BrowserRouter><App /></BrowserRouter></QueryClientProvider></StrictMode>,
);
