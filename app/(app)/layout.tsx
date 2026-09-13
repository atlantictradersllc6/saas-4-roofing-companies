import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { IconInfo } from "@/components/icons";
import { isDbConfigured } from "@/lib/db";
import { auth } from "@/auth";

/**
 * Shell for every signed-in page. When the database is configured we require a
 * session (multi-tenant, real auth); without a DB we stay open for local
 * preview with sample data.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const connected = isDbConfigured();
  const session = connected ? await auth() : null;

  if (connected && !session) redirect("/login");

  const user = session?.user
    ? { name: session.user.name ?? null, email: session.user.email ?? null }
    : null;

  return (
    <div className="app">
      <Sidebar user={user} />
      <div className="main">
        {!connected && (
          <div className="dev-banner">
            <IconInfo />
            Preview mode — showing sample data. Set DATABASE_URL in .env.local to
            connect your Neon database.
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
