import { redirect } from "next/navigation";
import { auth, oauthEnabled } from "@/auth";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");
  return <LoginForm oauth={oauthEnabled} />;
}
