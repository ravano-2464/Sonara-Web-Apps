import { FindAccountForm } from "@/features/auth/components/find-account-form";

export default function FindAccountPage() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.12),transparent_28%)]" />
            <FindAccountForm />
        </div>
    );
}
