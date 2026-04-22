"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { LanguageToggle } from "@/components/layout/language-toggle";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthToastContent } from "@/features/auth/components/auth-toast-content";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { mapSupabaseErrorMessage } from "@/lib/supabase/error";

const FIND_ACCOUNT_TOAST_DURATION_MS = 5000;

export function FindAccountForm() {
    const { t } = useI18n();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);

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
                    durationMs={FIND_ACCOUNT_TOAST_DURATION_MS}
                />
            ),
            {
                duration: FIND_ACCOUNT_TOAST_DURATION_MS,
                className: "sonara-toast-shell",
            },
        );
    };

    const submit = async () => {
        const normalizedEmail = email.trim();

        if (!normalizedEmail) {
            setError(t("findAccount.emailRequired"));
            setUsername(null);
            return;
        }

        setLoading(true);
        setError(null);
        setUsername(null);

        const supabase = getSupabaseBrowserClient();
        const { data: resolvedUsername, error: resolveError } = await supabase.rpc(
            "resolve_username_by_email",
            {
                account_email: normalizedEmail,
            },
        );

        setLoading(false);

        if (resolveError) {
            const message = mapSupabaseErrorMessage(resolveError.message);
            setError(message);
            showToast({
                title: t("findAccount.failedTitle"),
                description: message,
                tone: "error",
            });
            return;
        }

        if (!resolvedUsername) {
            const message = t("findAccount.notFound");
            setError(message);
            showToast({
                title: t("findAccount.notFoundTitle"),
                description: message,
                tone: "error",
            });
            return;
        }

        setUsername(resolvedUsername);
        showToast({
            title: t("findAccount.foundTitle"),
            description: t("findAccount.foundDescription"),
            tone: "success",
        });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        await submit();
    };

    return (
        <section className="mx-auto w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/75 p-6 shadow-2xl shadow-black/40">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h1 className="text-xl font-semibold text-zinc-50">{t("findAccount.title")}</h1>
                    <p className="mt-1 text-sm text-zinc-400">{t("findAccount.description")}</p>
                </div>
                <LanguageToggle className="shrink-0" />
            </div>

            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
                <Input
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? t("findAccount.searching") : t("findAccount.searchButton")}
                </Button>
                {username ? (
                    <p className="text-sm text-emerald-300">
                        {t("findAccount.result", {
                            username,
                        })}
                    </p>
                ) : null}
                {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            </form>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3">
                <Link href="/auth/login" className="text-sm text-cyan-300 hover:text-cyan-200">
                    {t("findAccount.backToSignIn")}
                </Link>
                <Link href="/forgot-password" className="text-sm text-cyan-300 hover:text-cyan-200">
                    {t("findAccount.backToForgotPassword")}
                </Link>
            </div>
        </section>
    );
}
