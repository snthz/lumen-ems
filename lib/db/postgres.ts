import postgres from "postgres"

/**
 * Postgres connection — only active when DATABASE_URL is set.
 * When not configured the app falls back to file-based defaults.
 *
 * Tables are created automatically on first use via `ensureDb()`.
 */

let sql: postgres.Sql | null = null
let migrated: Promise<void> | null = null

/** True when Next.js is building (prerendering static pages). */
const isBuilding = process.env.NEXT_PHASE === "phase-production-build"
    || process.env.__NEXT_BUILD === "1"

/** Get the raw postgres.js instance (null when DATABASE_URL is unset). */
/** True when running on a serverless platform (Vercel). */
const isServerless = !!process.env.VERCEL

export function getDb(): postgres.Sql | null {
    if (!process.env.DATABASE_URL) return null
    if (!sql) {
        sql = postgres(process.env.DATABASE_URL, {
            max: isBuilding ? 1 : isServerless ? 1 : 10,
            idle_timeout: isBuilding ? 1 : isServerless ? 10 : 20,
            connect_timeout: 10,
            ssl: 'require',
            // Transaction pooler (PgBouncer) does not support prepared statements
            prepare: false,
            onclose: isBuilding ? () => { sql = null; migrated = null } : undefined,
        })

        // During build, ensure the pool closes so Node.js can exit
        if (isBuilding) {
            process.once("beforeExit", () => {
                sql?.end({ timeout: 0 }).catch(() => {})
            })
        }
    }
    return sql
}

export function hasDb(): boolean {
    return !!process.env.DATABASE_URL
}

/** Gracefully close the connection pool. */
export async function closeDb() {
    if (sql) {
        await sql.end({ timeout: 1 })
        sql = null
        migrated = null
    }
}

/**
 * Returns the postgres instance after ensuring all tables exist.
 * Safe to call repeatedly — migrations only run once per process.
 * Returns null when DATABASE_URL is not set or during next build.
 */
export async function ensureDb(): Promise<postgres.Sql | null> {
    // Skip DB during build — prerender uses empty defaults, runtime uses real DB
    if (isBuilding) return null

    const db = getDb()
    if (!db) {
        console.warn("[db] DATABASE_URL not set, skipping DB")
        return null
    }

    if (!migrated) {
        migrated = runAutoMigrations(db)
    }
    try {
        await migrated
        return db
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        const stack = err instanceof Error ? err.stack : ''
        console.error(`[db] Connection/migration failed: ${msg}\n${stack}`)
        sql = null
        migrated = null
        return null
    }
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
