"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AuthToastContent } from "@/features/auth/components/auth-toast-content";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const LOGOUT_TOAST_DURATION_MS = 4200;

export function useLogoutConfirm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const showToast = ({
    title,
    description,
    tone,
  }: {
    title: string;
    description: string;
    tone: "success" | "error" | "info";
  }) => {
    toast.custom(
      () => (
        <AuthToastContent
          title={title}
          description={description}
          tone={tone}
          durationMs={LOGOUT_TOAST_DURATION_MS}
        />
      ),
      {
        duration: LOGOUT_TOAST_DURATION_MS,
        className: "sonara-toast-shell",
      },
    );
  };

  const confirmLogout = async () => {
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();

    setLoading(false);

    if (error) {
      showToast({
        title: "Logout Gagal",
        description: error.message,
        tone: "error",
      });
      return;
    }

    setOpen(false);
    showToast({
      title: "Logout Berhasil",
      description: "Kamu telah keluar dari akun.",
      tone: "success",
    });
    router.push("/auth/login");
    router.refresh();
  };

  return {
    open,
    setOpen,
    loading,
    confirmLogout,
  };
}
