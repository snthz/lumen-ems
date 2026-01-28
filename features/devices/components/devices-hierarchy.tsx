'use client'

import React from 'react'
import { useAssetStore } from '@/features/asset/store/asset.store'
import { useDeviceStore, SelectedDevice } from '@/features/devices/store/device.store'
import { SidebarMenuSub } from '@/components/ui/sidebar'
import { AssetDevicesGroup } from "@/features/asset/components/asset-devices-group"
import { Button } from '@/components/ui/button'

export function DevicesHierarchy() {
    const selectedAssets = useAssetStore(state => state.selectedAssets)
    const assetEntries = Object.values(selectedAssets)
    
    const selectedDevices = useDeviceStore(state => state.selectedDevices)
    const addDevice = useDeviceStore(state => state.addDevice)
    const clearAllDevices = useDeviceStore(state => state.clearAllDevices)

    const allDevices: SelectedDevice[] = React.useMemo(() => {
        return assetEntries.flatMap(asset => 
            (asset.children?.filter(rel => rel.to.entityType === 'DEVICE') ?? []).map(rel => ({
                id: rel.to.id,
                name: rel.toName ?? 'Device',
                assetId: asset.to.id,
                assetName: asset.toName ?? 'Asset'
            }))
        )
    }, [assetEntries])

    const allSelected = allDevices.length > 0 && selectedDevices.length === allDevices.length
    const hasSelection = selectedDevices.length > 0

    function handleSelectAll() {
        allDevices.forEach(device => addDevice(device))
    }

    function handleClearAll() {
        clearAllDevices()
    }

    return (
        <div>
            <div className="border-b py-2 flex items-center justify-between px-6">
                <span className="text-sm text-neutral-500">Dispositivos</span>
                {allDevices.length > 0 && (
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSelectAll}
                            disabled={allSelected}
                            className="h-6 text-xs px-2"
                        >
                            Todos
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearAll}
                            disabled={!hasSelection}
                            className="h-6 text-xs px-2"
                        >
                            Limpiar
                        </Button>
                    </div>
                )}
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