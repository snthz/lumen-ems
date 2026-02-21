import { NextResponse } from "next/server"
import { runMigrations } from "@/lib/db/migrations"
import { hasDb } from "@/lib/db/postgres"

export async function POST() {
    if (!hasDb()) {
        return NextResponse.json({ message: "No database configured, using file-based storage" })
    }
    try {
        await runMigrations()
        return NextResponse.json({ message: "Migrations completed" })
    } catch (err) {
        console.error("Migration failed:", err)
        return NextResponse.json({ error: "Migration failed" }, { status: 500 })
    }
}
