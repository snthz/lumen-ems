import {z} from "zod"

const envSchema = z.object({
    EMS_INDUSTRIES_GROUP_ID: z.string().min(1, "EMS_INDUSTRIES_GROUP_ID is required"),
    EMS_BILLING_GROUP_ID: z.string().min(1, "EMS_BILLING_GROUP_ID is required"),
    EMS_MULTISITE_GROUP_ID: z.string().min(1, "EMS_MULTISITE_GROUP_ID is required"),
    TB_API: z.string().min(1, "TB_API is required"),
    NEXT_PUBLIC_TB_API: z.string().min(1, "NEXT_PUBLIC_TB_API is required"),
    DATABASE_URL: z.string().optional(),
    DATA_DIR: z.string().optional(),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
    console.error("Invalid environment variables:", z.treeifyError(parsedEnv.error))
    throw new Error("Invalid environment variables")
}

export const env = parsedEnv.data