import { cn } from "@/lib/utils";
import { CircleCheck, Info, OctagonX } from "lucide-react";

export type AuthToastTone = "success" | "error" | "info";

interface AuthToastContentProps {
    title: string;
    description: string;
    durationMs: number;
    tone: AuthToastTone;
}

const progressToneClass: Record<AuthToastTone, string> = {
    success: "bg-[linear-gradient(90deg,#34d399,#10b981)]",
    error: "bg-[linear-gradient(90deg,#fb7185,#f43f5e)]",
    info: "bg-[linear-gradient(90deg,#22d3ee,#0ea5e9)]",
};

const toneBorderClass: Record<AuthToastTone, string> = {
    success: "border-emerald-400/35",
    error: "border-rose-400/35",
    info: "border-cyan-400/35",
};

const toneIconShellClass: Record<AuthToastTone, string> = {
    success: "bg-emerald-400/15 text-emerald-300",
    error: "bg-rose-400/15 text-rose-300",
    info: "bg-cyan-400/15 text-cyan-300",
};

export function AuthToastContent({
    title,
    description,
    durationMs,
    tone,
}: AuthToastContentProps) {
    const Icon = tone === "success" ? CircleCheck : tone === "error" ? OctagonX : Info;

    return (
        <div
            className={cn(
                "min-w-[320px] max-w-[360px] rounded-xl border bg-zinc-950/95 px-3.5 py-3 shadow-2xl shadow-black/55 backdrop-blur-md",
                toneBorderClass[tone],
            )}
        >
            <div className="flex items-start gap-2.5">
                <div
                    className={cn(
                        "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full",
                        toneIconShellClass[tone],
                    )}
                >
                    <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-100">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-300">{description}</p>
                </div>
            </div>

            <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/85">
                <div
                    className={cn(
                        "toast-progress-shrink h-full rounded-full",
                        progressToneClass[tone],
                    )}
                    style={{ animationDuration: `${durationMs}ms` }}
                />
            </div>
        </div>
    );
}
