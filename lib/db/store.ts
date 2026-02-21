import { getDb, hasDb } from "./postgres"
import { readFile, writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const DATA_DIR = process.env.DATA_DIR || "/data"
const SETTINGS_FILE = join(DATA_DIR, "settings.json")

// ─── Settings ────────────────────────────────────────────

export type SettingsMap = Record<string, string>

export async function getAllSettings(): Promise<SettingsMap> {
    if (hasDb()) {
        const sql = getDb()!
        const rows = await sql`SELECT key, value FROM settings`
        const map: SettingsMap = {}
        for (const r of rows) map[r.key] = r.value
        return map
    }

    // Fallback: JSON file
    try {
        if (existsSync(SETTINGS_FILE)) {
            const raw = await readFile(SETTINGS_FILE, "utf-8")
            return JSON.parse(raw)
        }
    } catch { /* ignore */ }
    return {}
}

export async function getSetting(key: string): Promise<string | null> {
    const all = await getAllSettings()
    return all[key] ?? null
}

export async function setSetting(key: string, value: string): Promise<void> {
    if (hasDb()) {
        const sql = getDb()!
        await sql`
            INSERT INTO settings (key, value, updated_at)
            VALUES (${key}, ${value}, now())
            ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = now()
        `
        return
    }

    // Fallback: JSON file
    const all = await getAllSettings()
    all[key] = value
    await mkdir(DATA_DIR, { recursive: true })
    await writeFile(SETTINGS_FILE, JSON.stringify(all, null, 2))
}

export async function setSettings(entries: Record<string, string>): Promise<void> {
    for (const [k, v] of Object.entries(entries)) {
        await setSetting(k, v)
    }
}

// ─── File storage ────────────────────────────────────────

export async function saveFile(
    id: string,
    filename: string,
    mimeType: string,
    data: Buffer
): Promise<void> {
    if (hasDb()) {
        const sql = getDb()!
        await sql`
            INSERT INTO uploaded_files (id, filename, mime_type, data, created_at)
            VALUES (${id}, ${filename}, ${mimeType}, ${data}, now())
            ON CONFLICT (id) DO UPDATE
                SET filename = ${filename}, mime_type = ${mimeType}, data = ${data}, created_at = now()
        `
        return
    }

    // Fallback: file system
    const dir = join(DATA_DIR, "uploads")
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, id), data)
    // Save metadata
    const metaPath = join(dir, `${id}.meta.json`)
    await writeFile(metaPath, JSON.stringify({ filename, mimeType }))
}

export async function getFile(id: string): Promise<{ filename: string; mimeType: string; data: Buffer } | null> {
    if (hasDb()) {
        const sql = getDb()!
        const rows = await sql`SELECT filename, mime_type, data FROM uploaded_files WHERE id = ${id}`
        if (rows.length === 0) return null
        return {
            filename: rows[0].filename,
            mimeType: rows[0].mime_type,
            data: rows[0].data as Buffer,
        }
    }

    // Fallback: file system
    const dir = join(DATA_DIR, "uploads")
    const filePath = join(dir, id)
    const metaPath = join(dir, `${id}.meta.json`)
    try {
        const data = await readFile(filePath)
        const meta = JSON.parse(await readFile(metaPath, "utf-8"))
        return { filename: meta.filename, mimeType: meta.mimeType, data }
    } catch {
        return null
    }
}

export async function deleteFile(id: string): Promise<void> {
    if (hasDb()) {
        const sql = getDb()!
        await sql`DELETE FROM uploaded_files WHERE id = ${id}`
        return
    }
    
    const dir = join(DATA_DIR, "uploads")
    const { unlink } = await import("fs/promises")
    try { await unlink(join(dir, id)) } catch { /* ignore */ }
    try { await unlink(join(dir, `${id}.meta.json`)) } catch { /* ignore */ }
}
