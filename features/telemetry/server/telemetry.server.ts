import {BuiltTelemetryQuery} from "@/features/telemetry/services/build-telemetry-query";

export async function fetchTelemetry(
    query: BuiltTelemetryQuery
) {
    // 🚧 IMPLEMENTACIÓN REAL VA AQUÍ 🚧
    // ThingsBoard / backend / etc.

    console.log('Fetching telemetry with query:', query)

    // placeholder
    return Promise.resolve({
        data: [],
    })
}
