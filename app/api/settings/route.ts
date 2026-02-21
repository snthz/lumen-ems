import { NextRequest, NextResponse } from "next/server"
import { getAllSettings, setSettings } from "@/lib/db/store"

/** Env vars that act as fallbacks for DB settings */
function getEnvDefaults(): Record<string, string> {
    return {
        "config.tbApi": process.env.TB_API || "",
        "config.industriesGroupId": process.env.EMS_INDUSTRIES_GROUP_ID || "",
        "config.billingGroupId": process.env.EMS_BILLING_GROUP_ID || "",
        "config.multisiteGroupId": process.env.EMS_MULTISITE_GROUP_ID || "",
    }
}

export async function GET() {
    try {
        const settings = await getAllSettings()
        return NextResponse.json({ settings, envDefaults: getEnvDefaults() })
    } catch (err) {
        console.error("Failed to load settings:", err)
        return NextResponse.json({ settings: {}, envDefaults: getEnvDefaults() }, { status: 500 })
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
        const message = err instanceof Error ? err.message : String(err)
        const stack = err instanceof Error ? err.stack : undefined
        console.error("Failed to save settings:", message, stack)
        return NextResponse.json({ error: "Failed to save", detail: message }, { status: 500 })
    }
}
