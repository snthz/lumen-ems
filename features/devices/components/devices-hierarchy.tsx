'use client'

import React from 'react'
import { useAssetStore } from '@/features/asset/store/asset.store'
import { useDeviceStore, SelectedDevice } from '@/features/devices/store/device.store'
import { SidebarMenuSub } from '@/components/ui/sidebar'
import { AssetDevicesGroup } from "@/features/asset/components/asset-devices-group"
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'

export function DevicesHierarchy({ defaultOpen = true }: { defaultOpen?: boolean }) {
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
        <Collapsible defaultOpen={defaultOpen}>
            <div className="border-b py-2 flex items-center justify-between px-6">
                <CollapsibleTrigger className="flex items-center gap-1 cursor-pointer text-sm text-neutral-500 group">
                    <ChevronDown className="size-3.5 transition-transform group-data-[state=closed]:-rotate-90" />
                    Dispositivos
                </CollapsibleTrigger>
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
            <CollapsibleContent>
            
            {assetEntries.length === 0 ? (
                <div className="text-xs text-neutral-400 px-6 py-4 text-center">
                    No hay dispositivos asociados a los activos seleccionados.
                </div>
            ) : (
                <SidebarMenuSub className="mx-0 pl-2 pr-0 py-2 border-l-0">
                    {assetEntries
                        .map(asset => ({
                            asset,
                            deviceRelations:
                                asset.children?.filter(
                                    rel => rel.to.entityType === 'DEVICE'
                                ) ?? [],
                        }))
                        .filter(({ deviceRelations }) => deviceRelations.length > 0)
                        .map(({ asset, deviceRelations }, index, groups) => (
                            <AssetDevicesGroup
                                key={asset.to.id}
                                assetName={asset.toName ?? 'Asset'}
                                relations={deviceRelations}
                                isLast={index === groups.length - 1}
                            />
                        ))}
                </SidebarMenuSub>
            )}
            </CollapsibleContent>
        </Collapsible>
    )
}