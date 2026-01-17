import Redis from "ioredis"
import {env} from "@/lib/config/env";

if(!env.REDIS_URL){
    throw new Error("REDIS_URL environment variable is missing")
}
const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true
})

export default redis