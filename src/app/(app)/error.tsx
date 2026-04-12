"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-rose-900 bg-rose-950/20 p-6">
      <h2 className="text-lg font-semibold text-rose-300">Something went wrong</h2>
      <p className="mt-2 text-sm text-rose-200/80">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md bg-rose-500 px-3 py-2 text-sm text-white hover:bg-rose-400"
      >
        Try again
      </button>
    </div>
  );
}
