import { Suspense } from "react";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

function ResetPasswordFallback() {
  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/75 p-6">
      <p className="text-sm text-zinc-400">Loading reset password form...</p>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.12),transparent_28%)]" />
      <Suspense fallback={<ResetPasswordFallback />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
