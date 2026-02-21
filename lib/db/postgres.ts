import postgres from "postgres"

/**
 * Postgres connection — only active when DATABASE_URL is set.
 * When not configured the app falls back to file-based defaults.
 */

let sql: postgres.Sql | null = null

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
