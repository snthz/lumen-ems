import {z} from "zod"

const envSchema = z.object({
    EMS_INDUSTRIES_GROUP_ID: z.string().default(""),
    EMS_BILLING_GROUP_ID: z.string().default(""),
    EMS_MULTISITE_GROUP_ID: z.string().default(""),
    TB_API: z.string().default(""),
    NEXT_PUBLIC_TB_API: z.string().default(""),
    DATABASE_URL: z.string().optional(),
    DATA_DIR: z.string().optional(),
})

/**
 * Lazy-parsed env: validation runs on first access so the module can be
 * imported safely during `next build` (prerender) even when server-only
 * vars like TB_API are not yet available.
 */
let _env: z.infer<typeof envSchema> | null = null

function getEnv() {
    if (!_env) {
        const parsed = envSchema.safeParse(process.env)
        if (!parsed.success) {
            console.error("Invalid environment variables:", z.treeifyError(parsed.error))
            throw new Error("Invalid environment variables")
        }
        _env = parsed.data
    }
    return _env
}

export const env = new Proxy({} as z.infer<typeof envSchema>, {
    get(_target, prop: string) {
        return getEnv()[prop as keyof z.infer<typeof envSchema>]
    },
})