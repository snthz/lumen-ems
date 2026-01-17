import {z} from "zod"

const envSchema = z.object({
    EMS_GROUP_ID: z.string().min(1, "EMS_GROUP_ID is required"),
    REDIS_URL: z.url("REDIS_URL must be a valid URL"),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
    console.error("Invalid environment variables:", z.treeifyError(parsedEnv.error))
    throw new Error("Invalid environment variables")
}

export const env = parsedEnv.data