import type { Metadata } from "next";

import LogoutButton from "@/components/admin/LogoutButton";
import WorkForm from "@/components/admin/WorkForm";
import { getAdminWorks, type AdminWork } from "@/lib/works";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Featured designs",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  let works: AdminWork[] = [];
  let databaseError = false;

  try {
    works = await getAdminWorks();
  } catch (error) {
    console.error("[admin] could not load works:", error);
    databaseError = true;
  }

  return (
    <main className="admin-shell">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">Mando Adel — Admin</p>
            <h1 className="admin-title">Featured designs</h1>
            <p className="admin-sub">
              Paste a Behance or Google Drive link for each project. When the
              link changes, the cover image is pulled from the link
              automatically; otherwise the current cover stays in place.
            </p>
          </div>
          <LogoutButton />
        </header>

        {databaseError ? (
          <div className="admin-alert">
            <strong>Database unavailable.</strong> Start Postgres with{" "}
            <code>npm run db:up</code>, then push the schema with{" "}
            <code>npm run db:push</code>.
          </div>
        ) : (
          <div className="admin-grid">
            {works.map((work) => (
              <WorkForm key={work.slug} work={work} />
            ))}
          </div>
        )}

        <p className="admin-note">
          Drive files must be shared with <strong>“Anyone with the link”</strong>{" "}
          so the preview can load. Drive <em>folder</em> links cannot be
          previewed — paste the link to a single image file instead. Behance
          pages are read for their cover image; if Behance blocks the request,
          the existing cover is kept.
        </p>
      </div>
    </main>
  );
}
