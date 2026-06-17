import {resolveConfig} from "@/lib/config/resolve";
import {getAuthToken} from "@/lib/utils";
import {cookies} from "next/headers";
import {ApiResponse} from "@/lib/services/types";
import {
    TbCustomerDto,
    TbCustomersResponse,
    TbEntityType,
    TbRelation,
    TelemetryQueryParams,
    TelemetryTimeseriesResponse
} from "@/lib/thingsboard/thingsboard.types";

export interface CustomerWithRelations {
    customer: TbCustomerDto;
    relations: TbRelation[];
}

export interface CustomerGroup {
    label: string;
    groupId: string;
    customers: CustomerWithRelations[];
}

export type CustomerGroupsResponse = CustomerGroup[];

export interface CustomerGroupsResult {
    configured: boolean;
    groups: CustomerGroupsResponse;
}

async function fetchCustomersByGroupId(groupId: string, token: string, tbApi: string): Promise<TbCustomersResponse> {
    const response = await fetch(`${tbApi}/api/entityGroup/${groupId}/customers?pageSize=1000&page=0&sortOrder=DESC`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        console.error(`Error fetching customers for entity group ${groupId}:`, await response.text());
        return [];
    }

    const json = await response.json();
    return (json.data ?? []) as TbCustomersResponse;
}

export async function getCustomerGroups(): ApiResponse<CustomerGroupsResult> {
    const cookieStore = await cookies()
    const token = getAuthToken(cookieStore)
    const cfg = await resolveConfig()

    const allDefinitions = [
        { label: "Industrias", groupId: cfg.industriesGroupId },
        { label: "Multisitio", groupId: cfg.multisiteGroupId },
        { label: "Facturación", groupId: cfg.billingGroupId },
    ]

    // Filter out groups with missing/empty IDs to avoid bad API calls
    const configuredDefinitions = allDefinitions.filter((def) => !!def.groupId)
    const anyConfigured = configuredDefinitions.length > 0

    if (!anyConfigured) {
        return { success: true, data: { configured: false, groups: [] } }
    }

    const groups = await Promise.all(
        configuredDefinitions.map(async (def) => {
            const rawCustomers = await fetchCustomersByGroupId(def.groupId, token, cfg.tbApi)

            // Pre-fetch relations server-side and filter out customers with no children
            const customersWithRelations = await Promise.all(
                rawCustomers.map(async (customer) => {
                    const visited = new Set<string>()
                    const relations = await fetchAssetsRelationsRecursive(customer.id.id, 'CUSTOMER', visited)
                    return { customer, relations }
                })
            )

            return {
                label: def.label,
                groupId: def.groupId,
                customers: customersWithRelations.filter((c) => c.relations.length > 0),
            }
        })
    )

    // Only return groups with at least one accessible customer
    const accessibleGroups = groups.filter((g) => g.customers.length > 0)

    return {
        success: true,
        data: { configured: true, groups: accessibleGroups },
    }
}

export async function fetchAssetsRelationsRecursive(
    fromId: string,
    fromType: TbEntityType,
    visited: Set<string>
): Promise<TbRelation[]> {
    const key = `${fromType}:${fromId}`

    if (visited.has(key)) {
        return []
    }

    visited.add(key)

    const cookieStore = await cookies()
    const cfg = await resolveConfig()

    const res = await fetch(
        `${cfg.tbApi}/api/relations/info?fromId=${fromId}&fromType=${fromType}`,
        {
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': `Bearer ${getAuthToken(cookieStore)}`,
            },
            next: {
                revalidate: 120,
            }
        }
    )
    if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(
            `Error fetching relations for ${fromType}:${fromId}: ${res.status}${body ? ` - ${body}` : ''}`
        )
    }


    const json = await res.json()
    const relations = (json ?? []) as TbRelation[]
    let result: TbRelation[] = [...relations]

    for (const rel of relations) {
            rel.children = await fetchAssetsRelationsRecursive(
                rel.to.id,
                rel.to.entityType,
                visited
            )
    }

    return result
}

/**
 * ThingsBoard rejects an aggregated query whose (timeRange / interval) exceeds
 * ~700 buckets ("Incorrect TsKvQuery. Number of intervals is too high"). To keep
 * the requested resolution we split such queries into time chunks instead of
 * coarsening the interval. Empirically 700 is the hard limit (700 ok, 701 fails).
 */
const MAX_BUCKETS_PER_REQUEST = 700

export async function fetchTelemetryTimeseries(
    params: TelemetryQueryParams
): Promise<TelemetryTimeseriesResponse> {
    // Only aggregated queries are bucket-limited; raw (agg=NONE) queries are
    // bounded by `limit` instead, so they never need chunking.
    const isAggregated =
        params.interval !== undefined &&
        params.agg !== undefined &&
        params.agg !== 'NONE'

    if (!isAggregated) {
        return fetchTelemetryRange(params)
    }

    const intervalMs = params.interval as number
    const buckets = Math.ceil((params.endTs - params.startTs) / intervalMs)

    if (buckets <= MAX_BUCKETS_PER_REQUEST) {
        return fetchTelemetryRange(params)
    }

    // Split into chunks of <= MAX_BUCKETS_PER_REQUEST buckets. Each chunk spans a
    // whole multiple of the interval, so bucket timestamps align across chunks
    // and merge without gaps or overlaps.
    const chunkSpan = intervalMs * MAX_BUCKETS_PER_REQUEST
    const ranges: Array<{ startTs: number; endTs: number }> = []
    for (let start = params.startTs; start < params.endTs; start += chunkSpan) {
        ranges.push({ startTs: start, endTs: Math.min(start + chunkSpan, params.endTs) })
    }

    const parts = await Promise.all(
        ranges.map((range) => fetchTelemetryRange({ ...params, ...range }))
    )

    const merged: TelemetryTimeseriesResponse = {}
    for (const part of parts) {
        for (const key of Object.keys(part)) {
            ;(merged[key] ??= []).push(...part[key])
        }
    }
    for (const key of Object.keys(merged)) {
        merged[key].sort((a, b) => a.ts - b.ts)
    }

    return merged
}

async function fetchTelemetryRange(
    params: TelemetryQueryParams
): Promise<TelemetryTimeseriesResponse> {
    const cookieStore = await cookies()
    const cfg = await resolveConfig()

    const query = new URLSearchParams({
        keys: params.keys,
        startTs: String(params.startTs),
        endTs: String(params.endTs),
    })

    if (params.interval !== undefined) {
        query.set('interval', String(params.interval))
    }

    if (params.agg) {
        query.set('agg', params.agg)
    }

    if (params.limit) {
        query.set('limit', String(params.limit))
    }

    if (params.orderBy) {
        query.set('orderBy', params.orderBy)
    }

    if (params.useStrictDataTypes !== undefined) {
        query.set(
            'useStrictDataTypes',
            String(params.useStrictDataTypes)
        )
    }

    const url = `${cfg.tbApi}/api/plugins/telemetry/${params.entityType}/${params.entityId}/values/timeseries?${query.toString()}`
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': `Bearer ${getAuthToken(cookieStore)}`,
        },
        cache: 'no-store',
    })

    if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(
            `Error fetching telemetry for ${params.entityId} (key=${params.keys}): ${res.status} ${res.statusText || ''}${body ? ` - ${body}` : ''}`.trim()
        )
    }

    return await res.json() as TelemetryTimeseriesResponse
}