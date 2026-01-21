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
import { useDeviceStore } from '@/features/devices/store/device.store'
import clsx from 'clsx'
import {Button} from "@/components/ui/button";

export function DeviceTreeItem({ relation }: { relation: TbRelation }) {
    const deviceChildren =
        relation.children?.filter(
            child => child.to.entityType === 'DEVICE'
        ) ?? []

    const hasChildren = deviceChildren.length > 0
    const [open, setOpen] = React.useState(false)

    const toggleDevice = useDeviceStore(state => state.toggleDevice)
    const selectedDevices = useDeviceStore(state => state.selectedDevices)

    const assetId =  relation.from.id
    const isSelected = Boolean(
        selectedDevices[assetId]?.[relation.to.id]
    )

    function handleSelect(e: React.MouseEvent) {
        e.stopPropagation()
        toggleDevice(assetId, relation.to.id)
    }

    return (
        <SidebarMenuSubItem className="pl-0">
            <Collapsible open={open} onOpenChange={setOpen}>
                <div
                    className={clsx(
                        'flex items-center justify-between pl-0  cursor-pointer rounded-none',
                        isSelected && 'bg-neutral-100/70'
                    )}
                >
                    <SidebarMenuButton
                        className="pl-0 flex-1 cursor-pointer"
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
                        <CollapsibleTrigger asChild className={""}>
                            <Button
                                variant={"ghost"}
                                size={"icon-sm"}
                                onClick={e => e.stopPropagation()}
                                className=" cursor-pointer rounded-none hover:bg-neutral-200/50 "
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
                                />
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                )}
            </Collapsible>
        </SidebarMenuSubItem>
    )
}
