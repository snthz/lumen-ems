import {env} from "@/lib/config/env";

if(!env.REDIS_URL){
    console.log("[Redis] REDIS_URL is not defined in environment variables.");
}
// const redis = new Redis(env.REDIS_URL, {
//     maxRetriesPerRequest: 3,
//     enableReadyCheck: true
// })
//
// export default redis