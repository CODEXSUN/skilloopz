import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children?: ReactNode;
  replace?: boolean;
  prefetch?: boolean;
};

export default function Link({ href, replace, prefetch: _prefetch, ...props }: LinkProps) {
  if (/^(https?:|mailto:|tel:)/.test(href)) return <a href={href} {...props} />;
  return <RouterLink to={href} replace={replace} {...props} />;
}
