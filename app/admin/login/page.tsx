import type { Metadata } from "next";

import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="admin-login">
      <div className="admin-login-card">
        <p className="admin-eyebrow">Mando Adel</p>
        <h1 className="admin-title">Admin</h1>
        <p className="admin-sub">Sign in to edit the three featured designs.</p>
        <LoginForm />
      </div>
    </main>
  );
}
