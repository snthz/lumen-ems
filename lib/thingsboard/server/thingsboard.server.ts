import {resolveConfig} from "@/lib/config/resolve";
import {getAuthToken} from "@/lib/utils";
import {cookies} from "next/headers";
import {ApiResponse} from "@/lib/services/types";
import {
    TbCustomersResponse,
    TbEntityType,
    TbRelation,
    TelemetryQueryParams,
    TelemetryTimeseriesResponse
} from "@/lib/thingsboard/thingsboard.types";

export interface CustomerGroup {
    label: string;
    groupId: string;
    customers: TbCustomersResponse;
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
        configuredDefinitions.map(async (def) => ({
            label: def.label,
            groupId: def.groupId,
            customers: await fetchCustomersByGroupId(def.groupId, token, cfg.tbApi),
        }))
    )

    // Only return groups where the user has permission (non-empty customer list)
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
        throw new Error(
            `Error fetching relations for ${fromType}:${fromId}`
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

export async function fetchTelemetryTimeseries(
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
        throw new Error(
            `Error fetching telemetry for ${params.entityId}: ${res.statusText}`
        )
    }

    return await res.json() as TelemetryTimeseriesResponse
}