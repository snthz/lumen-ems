import Redis from "ioredis"

if(!process.env.REDIS_URL){
    throw new Error("REDIS_URL environment variable is missing")
}
const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true
})

export default redis