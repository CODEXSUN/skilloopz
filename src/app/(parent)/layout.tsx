import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  const role = user?.role;

  if (!user) redirect("/login");
  if (role !== "parent") redirect("/");

  return <>{children}</>;
}
