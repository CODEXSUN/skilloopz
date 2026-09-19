"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { UserActions } from "@/components/admin/users/user-actions";

interface UserRecord {
  id: string;
  email: string | null;
  fullName: string | null;
  role: string;
  status: string;
  ageGroup: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  _count: {
    enrollments: number;
    courses: number;
  };
}

interface UserTableProps {
  users: UserRecord[];
  onUserUpdated: (userId: string) => void;
  onUserDeleted: (userId: string) => void;
}

const roleBadge: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  teacher: "secondary",
  parent: "outline",
  student: "outline",
};

export function UserTable({ users, onUserUpdated, onUserDeleted }: UserTableProps) {
  const router = useRouter();

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-tertiary-foreground">
        No users found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted">
          <tr>
            <th className="px-4 py-3 font-medium text-muted-foreground">User</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Age Group</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Courses</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Enrolled</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Joined</th>
            <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((u) => (
            <tr
              key={u.id}
              className="cursor-pointer transition-colors hover:bg-muted"
              onClick={() => router.push(`/admin/users/${u.id}`)}
            >
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-foreground">
                    {u.fullName || "Unnamed"}
                  </p>
                  <p className="text-xs text-tertiary-foreground">{u.email || "—"}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge variant={roleBadge[u.role] ?? "outline"}>
                  {u.role}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge variant={u.status === "suspended" ? "destructive" : u.status === "pending_approval" ? "secondary" : "outline"}>
                  {u.status === "pending_approval" ? "Pending" : u.status === "suspended" ? "Suspended" : "Active"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {u.ageGroup || "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {u._count.courses}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {u._count.enrollments}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {format(new Date(u.createdAt), "MMM d, yyyy")}
              </td>
              <td className="px-4 py-3">
                <div onClick={(e) => e.stopPropagation()}>
                  <UserActions
                    userId={u.id}
                    currentRole={u.role}
                    currentStatus={u.status}
                    onRoleChange={() => {
                      onUserUpdated(u.id);
                    }}
                    onStatusChange={() => {
                      onUserUpdated(u.id);
                    }}
                    onDelete={(userId) => onUserDeleted(userId)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
