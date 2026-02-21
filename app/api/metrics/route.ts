import { NextResponse } from "next/server"
import { getAllSettings, setSetting } from "@/lib/db/store"
import { TELEMETRY_GROUPS } from "@/features/telemetry/constants/telemetry.metrics"
import type { TelemetryGroup } from "@/features/telemetry/telemetry.types"

const METRICS_KEY = "metrics.config"

/** Merge saved config on top of built-in defaults.
 *  - Default metrics are always present; saved overrides (enabled, groups) are applied.
 *  - Custom metrics (not in defaults) are appended. */
function mergeWithDefaults(saved: TelemetryGroup[]): TelemetryGroup[] {
    const savedMap = new Map(saved.map((m) => [m.id, m]))

    // Start with defaults, applying any saved overrides
    const merged: TelemetryGroup[] = TELEMETRY_GROUPS.map((def) => {
        const override = savedMap.get(def.id)
        if (override) {
            return {
                ...def,
                enabled: override.enabled ?? def.enabled,
                groups: override.groups ?? def.groups,
                label: override.label ?? def.label,
                isDefault: true,
            }
        }
        return { ...def, isDefault: true }
    })

    // Append custom metrics (those not in defaults)
    const defaultIds = new Set(TELEMETRY_GROUPS.map((d) => d.id))
    for (const s of saved) {
        if (!defaultIds.has(s.id)) {
            merged.push({ ...s, isDefault: false })
        }
    }

    return merged
}

export async function GET() {
    try {
        const settings = await getAllSettings()
        const raw = settings[METRICS_KEY]
        let saved: TelemetryGroup[] = []
        if (raw) {
            try {
                saved = JSON.parse(raw)
            } catch { /* ignore bad JSON */ }
        }
        return NextResponse.json(mergeWithDefaults(saved))
    } catch (err) {
        return NextResponse.json({ error: "Failed to load metrics" }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const body: TelemetryGroup[] = await req.json()
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: "Body must be an array" }, { status: 400 })
        }
        await setSetting(METRICS_KEY, JSON.stringify(body))
        // Return the merged result
        return NextResponse.json(mergeWithDefaults(body))
    } catch (err) {
        return NextResponse.json({ error: "Failed to save metrics" }, { status: 500 })
    }
}
