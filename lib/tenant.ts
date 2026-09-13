import { auth } from "@/auth";

/**
 * The current signed-in user's company id — the key to multi-tenancy.
 * Every data query and write scopes to this, so one company can never see or
 * touch another's rows. Returns null when signed out.
 */
export async function currentCompanyId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.companyId ?? null;
}
