import { getDb } from "./postgres"

/**
 * Run on app startup to ensure tables exist.
 * Safe to call multiple times (IF NOT EXISTS).
 */
export async function runMigrations() {
    const sql = getDb()
    if (!sql) return

    await sql`
        CREATE TABLE IF NOT EXISTS settings (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    `

    await sql`
        CREATE TABLE IF NOT EXISTS uploaded_files (
            id         TEXT PRIMARY KEY,
            filename   TEXT NOT NULL,
            mime_type  TEXT NOT NULL,
            data       BYTEA NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    `

    await sql`
        CREATE TABLE IF NOT EXISTS custom_metrics (
            id         TEXT PRIMARY KEY,
            label      TEXT NOT NULL,
            keys       TEXT NOT NULL,
            unit       TEXT NOT NULL DEFAULT '',
            phase_scope TEXT NOT NULL DEFAULT 'SYSTEM',
            category   TEXT NOT NULL,
            chart_type TEXT NOT NULL DEFAULT 'line',
            agg        TEXT NOT NULL DEFAULT 'AVG',
            favorite   BOOLEAN NOT NULL DEFAULT false,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    `
}
