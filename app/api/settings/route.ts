import { NextRequest, NextResponse } from "next/server"
import { getAllSettings, setSettings } from "@/lib/db/store"

export async function GET() {
    try {
        const settings = await getAllSettings()
        return NextResponse.json(settings)
    } catch (err) {
        console.error("Failed to load settings:", err)
        return NextResponse.json({}, { status: 500 })
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        if (typeof body !== "object" || body === null) {
            return NextResponse.json({ error: "Body must be a JSON object" }, { status: 400 })
        }

        // Validate all values are strings
        const entries: Record<string, string> = {}
        for (const [k, v] of Object.entries(body)) {
            entries[k] = String(v)
        }

        await setSettings(entries)
        const updated = await getAllSettings()
        return NextResponse.json(updated)
    } catch (err) {
        console.error("Failed to save settings:", err)
        return NextResponse.json({ error: "Failed to save" }, { status: 500 })
    }
}
