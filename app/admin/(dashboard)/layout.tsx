import { redirect } from "next/navigation";

import { isAdmin } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }

  return children;
}
