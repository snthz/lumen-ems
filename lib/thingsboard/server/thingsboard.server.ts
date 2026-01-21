import {env} from "@/lib/config/env";
import {getAuthToken} from "@/lib/utils";
import {cookies} from "next/headers";
import {ApiResponse} from "@/lib/services/types";
import {TbCustomersResponse} from "@/lib/thingsboard/thingsboard.types";

export async function getCustomersByEntityGroup():ApiResponse<TbCustomersResponse> {
    const cookieStore = await cookies()
    const entityGroupId = env.EMS_GROUP_ID
    const response = await fetch(`${env.TB_API}/api/entityGroup/${entityGroupId}/customers?pageSize=1000&page=0&sortOrder=DESC`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': `Bearer ${getAuthToken(cookieStore)}`,
        },
    });
    if (!response.ok) {
        throw new Error(`Error fetching customers for entity group ${entityGroupId}: ${response.statusText}`);
    }
    const json = await response.json();
    return {
        success: true,
        data: json.data as TbCustomersResponse,
    }

}