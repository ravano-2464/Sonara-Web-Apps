const MISSING_TABLE_PATTERN = /Could not find the table 'public\.([^']+)' in the schema cache/i;

export function mapSupabaseErrorMessage(message: string): string {
  const normalized = message.trim();
  const tableMatch = normalized.match(MISSING_TABLE_PATTERN);

  if (tableMatch?.[1]) {
    return `Tabel public.${tableMatch[1]} belum ada di database Supabase. Jalankan SQL di supabase/schema.sql pada Supabase SQL Editor, lalu refresh aplikasi.`;
  }

  return normalized;
}

export function isMissingTableSchemaCacheError(message: string): boolean {
  return MISSING_TABLE_PATTERN.test(message);
}
