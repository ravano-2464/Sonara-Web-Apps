const MISSING_TABLE_PATTERN = /Could not find the table 'public\.([^']+)' in the schema cache/i;
const DUPLICATE_USERNAME_PATTERN = /idx_users_display_name_lower_unique/i;

export function mapSupabaseErrorMessage(message: string): string {
  const normalized = message.trim();
  const tableMatch = normalized.match(MISSING_TABLE_PATTERN);

  if (tableMatch?.[1]) {
    return `Tabel public.${tableMatch[1]} belum ada di database Supabase. Jalankan SQL di supabase/schema.sql pada Supabase SQL Editor, lalu refresh aplikasi.`;
  }

  if (DUPLICATE_USERNAME_PATTERN.test(normalized)) {
    return "Username sudah dipakai. Coba username lain.";
  }

  return normalized;
}

export function isMissingTableSchemaCacheError(message: string): boolean {
  return MISSING_TABLE_PATTERN.test(message);
}
