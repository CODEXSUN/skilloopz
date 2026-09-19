export interface SiteTheme {
  id: string;
  name: string;
  is_active: boolean;
  tokens: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    font_heading: string;
    font_body: string;
    radius: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PageSection {
  id: string;
  page_id: string;
  block_type: string;
  sort_order: number;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  path: string;
  status: "draft" | "published";
  layout: "default" | "full_width" | "landing";
  seo: {
    title?: string;
    description?: string;
    og_image?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface SystemLog {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}
