import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AuthIndexPage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/home");
  }

  redirect("/auth/login");
}
