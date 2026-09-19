import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    include: {
      user: { select: { id: true, fullName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All platform notifications.
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {notifications.length} recent notification{notifications.length !== 1 ? "s" : ""}
      </p>

      {notifications.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No notifications yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Message</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {notifications.map((n) => (
                <tr key={n.id} className="transition-colors hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">{n.type}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{n.title}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">{n.message}</td>
                  <td className="px-4 py-3 text-foreground">
                    {n.user.fullName ?? n.user.email ?? "Unknown"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                    {format(new Date(n.createdAt), "MMM d, yyyy HH:mm")}
                  </td>
                  <td className="px-4 py-3">
                    {n.readAt ? (
                      <Badge variant="secondary" className="text-xs">Read</Badge>
                    ) : (
                      <Badge className="text-xs">Unread</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
