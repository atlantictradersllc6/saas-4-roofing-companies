import Sidebar from "@/components/Sidebar";
import { IconInfo } from "@/components/icons";
import { isDbConfigured } from "@/lib/db";

/**
 * Shell for every page. Renders the sidebar + main column, plus a banner while
 * the database isn't connected (so the app is browsable with sample data).
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const connected = isDbConfigured();

  return (
    <div className="app">
      <Sidebar />
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
