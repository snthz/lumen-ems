import { getAllSettings } from "@/lib/db/store"
import { env } from "./env"

/**
 * Resolved config: DB values take priority, env vars are fallback.
 * Call this in server components / API routes that need config values.
 */
export async function resolveConfig() {
    const settings = await getAllSettings()

    return {
        tbApi: settings["config.tbApi"] || env.TB_API,
        industriesGroupId: settings["config.industriesGroupId"] || env.EMS_INDUSTRIES_GROUP_ID,
        billingGroupId: settings["config.billingGroupId"] || env.EMS_BILLING_GROUP_ID,
        multisiteGroupId: settings["config.multisiteGroupId"] || env.EMS_MULTISITE_GROUP_ID,
    }
}
