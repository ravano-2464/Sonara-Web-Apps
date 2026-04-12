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

  const { data: profile } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const metadataDisplayName =
    typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name.trim()
      : null;

  const emailUsername = user.email?.split("@")[0]?.trim() ?? null;

  const username =
    profile?.display_name?.trim() ||
    metadataDisplayName ||
    emailUsername ||
    undefined;

  return <AppShell username={username}>{children}</AppShell>;
}
