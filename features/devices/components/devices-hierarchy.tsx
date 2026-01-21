'use client'

import React from 'react'
import {useAssetStore} from '@/features/asset/store/asset.store'
import {SidebarMenuSub} from '@/components/ui/sidebar'
import {AssetDevicesGroup} from "@/features/asset/components/asset-devices-group";

export function DevicesHierarchy() {
    const selectedAssets = useAssetStore(state => state.selectedAssets)
    const assetEntries = Object.values(selectedAssets)

    return (
        <div className={""}>
            <div className={"border-y py-2"}>
                <span className="px-6 text-sm text-neutral-500">Dispositivos</span>
            </div>
            {assetEntries.length === 0 ? (
                <div className="text-xs text-neutral-400 px-6 py-4 text-center">
                    No hay dispositivos asociados a los activos seleccionados.
                </div>
            ) : (
                <SidebarMenuSub className="pl-0 py-2">
                    {assetEntries.map(asset => {
                        const deviceRelations =
                            asset.children?.filter(
                                rel => rel.to.entityType === 'DEVICE'
                            ) ?? []

                        if (deviceRelations.length === 0) return null

                        return (
                            <AssetDevicesGroup
                                key={asset.to.id}
                                assetName={asset.toName ?? 'Asset'}
                                relations={deviceRelations}
                            />
                        )
                    })}
                </SidebarMenuSub>
            )}
        </div>
    )
}
