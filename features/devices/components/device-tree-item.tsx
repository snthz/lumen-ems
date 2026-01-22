'use client'

import React from 'react'
import { TbRelation } from '@/lib/thingsboard/thingsboard.types'
import {
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronRight, Eye } from 'lucide-react'
import { SelectedDevice, useDeviceStore } from '@/features/devices/store/device.store'
import clsx from 'clsx'
import { Button } from "@/components/ui/button"

export function DeviceTreeItem({
                                   relation,
                                   assetId,
                                   assetName
                               }: {
    relation: TbRelation
    assetId: string
    assetName: string
}) {
    const deviceChildren =
        relation.children?.filter(
            child => child.to.entityType === 'DEVICE'
        ) ?? []

    const hasChildren = deviceChildren.length > 0
    const [open, setOpen] = React.useState(false)

    const toggleDevice = useDeviceStore(state => state.toggleDevice)

    const deviceId = relation.to.id

    // ✅ OPCIÓN 1: Usar un selector que ya evalúa el resultado
    const isSelected = useDeviceStore(state =>
        state.selectedDevices.some(d => d.id === deviceId)
    )

    function handleSelect(e: React.MouseEvent) {
        e.stopPropagation()

        const device: SelectedDevice = {
            id: deviceId,
            name: relation.additionalInfo?.name || relation.toName || 'Device',
            assetId: assetId,
            assetName: assetName,
        }

        toggleDevice(device)
    }

    return (
        <SidebarMenuSubItem className="pl-0">
            <Collapsible open={open} onOpenChange={setOpen}>
                <div
                    className={clsx(
                        'flex items-center justify-between pl-0 cursor-pointer rounded-none',
                        isSelected && 'bg-neutral-100/70'
                    )}
                >
                    <SidebarMenuButton
                        className="pl-0 flex-1 cursor-pointer rounded-none"
                        onClick={handleSelect}
                    >
                        <span className="flex items-center gap-2 w-full">
                            <div className="w-4 h-px bg-neutral-200" />
                            <span className="text-xs">
                                {relation.additionalInfo?.name ?? relation.toName}
                            </span>
                        </span>

                        {isSelected && (
                            <Eye className="size-4 text-neutral-400 ml-2" />
                        )}
                    </SidebarMenuButton>

                    {hasChildren && (
                        <CollapsibleTrigger asChild>
                            <Button
                                variant={"ghost"}
                                size={"icon-sm"}
                                onClick={e => e.stopPropagation()}
                                className="cursor-pointer rounded-none hover:bg-neutral-200/50"
                            >
                                <ChevronRight
                                    className={clsx(
                                        'size-4 text-neutral-400 transition-transform',
                                        open && 'rotate-90'
                                    )}
                                />
                            </Button>
                        </CollapsibleTrigger>
                    )}
                </div>

                {hasChildren && (
                    <CollapsibleContent>
                        <SidebarMenuSub className="pl-0">
                            {deviceChildren.map(child => (
                                <DeviceTreeItem
                                    key={`${child.from.id}-${child.to.id}`}
                                    relation={child}
                                    assetId={assetId}
                                    assetName={assetName}
                                />
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                )}
            </Collapsible>
        </SidebarMenuSubItem>
    )
}