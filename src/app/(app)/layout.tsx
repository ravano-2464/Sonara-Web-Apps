import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <AppShell userEmail={user.email}>{children}</AppShell>;
}
