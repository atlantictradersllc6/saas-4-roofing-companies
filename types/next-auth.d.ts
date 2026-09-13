import type { DefaultSession } from "next-auth";

// Add our custom fields to the session + JWT so TypeScript knows about them.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      companyId: string;
      role: string;
    } & DefaultSession["user"];
  }
  interface User {
    companyId?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    companyId?: string;
    role?: string;
  }
}
