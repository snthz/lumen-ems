import postgres from "postgres"

/**
 * Postgres connection — only active when DATABASE_URL is set.
 * When not configured the app falls back to file-based defaults.
 *
 * Tables are created automatically on first use via `ensureDb()`.
 */

let sql: postgres.Sql | null = null
let migrated: Promise<void> | null = null

/** Get the raw postgres.js instance (null when DATABASE_URL is unset). */
export function getDb(): postgres.Sql | null {
    if (!process.env.DATABASE_URL) return null
    if (!sql) {
        sql = postgres(process.env.DATABASE_URL, {
            max: 10,
            idle_timeout: 20,
            connect_timeout: 10,
        })
    }
    return sql
}

export function hasDb(): boolean {
    return !!process.env.DATABASE_URL
}

/**
 * Returns the postgres instance after ensuring all tables exist.
 * Safe to call repeatedly — migrations only run once per process.
 * Returns null when DATABASE_URL is not set.
 */
export async function ensureDb(): Promise<postgres.Sql | null> {
    const db = getDb()
    if (!db) return null

    if (!migrated) {
        migrated = runAutoMigrations(db)
    }
    await migrated
    return db
}

/** Inline CREATE TABLE IF NOT EXISTS — no external dependency needed. */
async function runAutoMigrations(sql: postgres.Sql) {
    await sql`
        CREATE TABLE IF NOT EXISTS settings (
            key        TEXT PRIMARY KEY,
            value      TEXT NOT NULL,
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
            id          TEXT PRIMARY KEY,
            label       TEXT NOT NULL,
            keys        TEXT NOT NULL,
            unit        TEXT NOT NULL DEFAULT '',
            phase_scope TEXT NOT NULL DEFAULT 'SYSTEM',
            category    TEXT NOT NULL,
            chart_type  TEXT NOT NULL DEFAULT 'line',
            agg         TEXT NOT NULL DEFAULT 'AVG',
            favorite    BOOLEAN NOT NULL DEFAULT false,
            sort_order  INTEGER NOT NULL DEFAULT 0,
            created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    `
    console.log("[db] auto-migration complete — tables ensured")
}
