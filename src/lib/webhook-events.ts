const WEBHOOK_EVENTS = [
  "page.created",
  "page.published",
  "page.deleted",
  "user.created",
  "user.deleted",
  "course.created",
  "lesson.created",
  "media.uploaded",
  "theme.created",
  "role.changed",
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export const ALL_WEBHOOK_EVENTS: readonly string[] = WEBHOOK_EVENTS;

export const WEBHOOK_EVENT_LABELS: Record<WebhookEvent, string> = {
  "page.created": "Page Created",
  "page.published": "Page Published",
  "page.deleted": "Page Deleted",
  "user.created": "User Created",
  "user.deleted": "User Deleted",
  "course.created": "Course Created",
  "lesson.created": "Lesson Created",
  "media.uploaded": "Media Uploaded",
  "theme.created": "Theme Created",
  "role.changed": "Role Changed",
};

export function getEventLabel(event: string): string {
  return WEBHOOK_EVENT_LABELS[event as WebhookEvent] ?? event;
}
