const MISSING_TABLE_PATTERN = /Could not find the table 'public\.([^']+)' in the schema cache/i;
const MISSING_FUNCTION_PATTERN =
    /Could not find the function public\.([^(]+)\(([^)]*)\) in the schema cache/i;
const DUPLICATE_USERNAME_PATTERN = /idx_users_display_name_lower_unique/i;
const INVALID_EMAIL_PATTERN = /^Email address ".*" is invalid$/i;
const REDIRECT_URL_NOT_ALLOWED_PATTERN =
    /redirect.*(not allowed|not whitelisted|invalid)|redirect_to/i;
const CONFIRMATION_EMAIL_SEND_FAILED_PATTERN =
    /(error sending confirmation email|failed to send email|smtp)/i;

export function mapSupabaseErrorMessage(message: string): string {
    const normalized = message.trim();
    const tableMatch = normalized.match(MISSING_TABLE_PATTERN);

    if (tableMatch?.[1]) {
        return `Tabel public.${tableMatch[1]} belum ada di database Supabase. Jalankan SQL di supabase/schema.sql pada Supabase SQL Editor, lalu refresh aplikasi.`;
    }

    const functionMatch = normalized.match(MISSING_FUNCTION_PATTERN);

    if (functionMatch?.[1]) {
        return `Fungsi public.${functionMatch[1]} belum ada di database Supabase. Jalankan SQL di supabase/schema.sql pada Supabase SQL Editor, lalu refresh aplikasi.`;
    }

    if (DUPLICATE_USERNAME_PATTERN.test(normalized)) {
        return "Username sudah dipakai. Coba username lain.";
    }

    if (INVALID_EMAIL_PATTERN.test(normalized)) {
        return "Format email tidak valid atau domain email tidak diizinkan.";
    }

    if (REDIRECT_URL_NOT_ALLOWED_PATTERN.test(normalized)) {
        return "Redirect URL belum diizinkan di Supabase Auth URL Configuration. Tambahkan URL aplikasi kamu di bagian Site URL / Additional Redirect URLs.";
    }

    if (CONFIRMATION_EMAIL_SEND_FAILED_PATTERN.test(normalized)) {
        return "Email konfirmasi gagal dikirim. Cek pengaturan SMTP dan Email Auth di Supabase Dashboard.";
    }

    return normalized;
}

export function isMissingTableSchemaCacheError(message: string): boolean {
    return MISSING_TABLE_PATTERN.test(message);
}
