'use server'
import {fetchAssetsRelationsRecursive} from "@/lib/thingsboard/server/thingsboard.server";
import {TbEntityType, TbRelationsResponse} from "@/lib/thingsboard/thingsboard.types";

type VisitedMap = Set<string>

export async function getRelationsRecursiveFromAssetAction(
    fromId: string,
    fromType: TbEntityType
): Promise<TbRelationsResponse> {
    const visited: VisitedMap = new Set()

    return fetchAssetsRelationsRecursive(fromId, fromType, visited)
}
