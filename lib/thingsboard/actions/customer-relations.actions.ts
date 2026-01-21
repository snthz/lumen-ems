// lib/actions/customer-relations.actions.ts
'use server'

import { TbRelationsResponse } from '@/lib/thingsboard/thingsboard.types'
import {getRelationsRecursiveFromAssetAction} from "@/lib/thingsboard/actions/relations.action";

export async function getCustomerRelationsAction(
    customerId: string
): Promise<TbRelationsResponse> {
    return await getRelationsRecursiveFromAssetAction(customerId, 'CUSTOMER')
}
