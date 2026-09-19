"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorState } from "@/components/ui/error-state";
import { UserActions } from "@/components/admin/users/user-actions";
import { format } from "date-fns";

interface UserDetail {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: string;
  ageGroup: string | null;
  onboardingCompleted: boolean;
  metadata: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    enrollments: number;
    courses: number;
    lessonProgress: number;
  };
  enrollments: {
    id: string;
    course: { id: string; title: string };
    createdAt: string;
  }[];
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) return <LoadingScreen message="Loading user..." />;

  if (error || !user) {
    return (
      <div className="p-6">
        <ErrorState message={error ?? "User not found"} onRetry={() => router.refresh()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/users")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {user.fullName || "Unnamed User"}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email || "No email"}</p>
          </div>
          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
            {user.role}
          </Badge>
        </div>
        <UserActions
          userId={user.id}
          currentRole={user.role}
          onRoleChange={(_, newRole) => setUser((prev) => prev ? { ...prev, role: newRole } : prev)}
          onDelete={(_userId) => router.push("/admin/users")}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Enrollments</CardTitle>
            <CardDescription>{user._count.enrollments}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Courses</CardTitle>
            <CardDescription>{user._count.courses}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>{user._count.lessonProgress} records</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Recent Enrollments
        </h2>
        {user.enrollments.length === 0 ? (
          <p className="text-sm text-tertiary-foreground">No enrollments.</p>
        ) : (
          <div className="space-y-2">
            {user.enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
              >
                <p className="font-medium text-foreground">
                  {enrollment.course.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(enrollment.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Info</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">ID</dt>
              <dd className="font-mono text-xs text-foreground">{user.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Age Group</dt>
              <dd>{user.ageGroup || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Onboarding</dt>
              <dd>{user.onboardingCompleted ? "✅ Complete" : "❌ Incomplete"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Joined</dt>
              <dd>{format(new Date(user.createdAt), "MMM d, yyyy")}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
