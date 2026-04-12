function assertEnvValue(name: string, value: string | undefined): string {
    if (!value || value.trim().length === 0) {
        throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
}

export const env = {
    supabaseUrl: () =>
        assertEnvValue(
            "NEXT_PUBLIC_SUPABASE_URL",
            process.env.NEXT_PUBLIC_SUPABASE_URL,
        ),
    supabaseAnonKey: () =>
        assertEnvValue(
            "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        ),
};
