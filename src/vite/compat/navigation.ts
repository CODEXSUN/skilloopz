import { useLocation, useNavigate, useSearchParams as useRouterSearchParams } from "react-router-dom";

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => navigate(-1),
    refresh: () => window.location.reload(),
    prefetch: (_href: string) => Promise.resolve(),
  };
}

export function usePathname() {
  return useLocation().pathname;
}

export function useSearchParams() {
  return useRouterSearchParams()[0];
}
