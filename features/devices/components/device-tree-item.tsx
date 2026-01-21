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

export function DeviceTreeItem({ relation }: { relation: TbRelation }) {
    const deviceChildren =
        relation.children?.filter(
            child => child.to.entityType === 'DEVICE'
        ) ?? []

    const hasChildren = deviceChildren.length > 0
    const [open, setOpen] = React.useState(false)

    const { selectedDeviceId, toggleDevice } = useDeviceStore()
    const isSelected = selectedDeviceId === relation.to.id

    function handleSelect(e: React.MouseEvent) {
        e.stopPropagation()
        toggleDevice(relation.to.id)
    }

    return (
        <SidebarMenuSubItem className="pl-0">
            <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={`pl-0  rounded-none cursor-pointer ${isSelected && "bg-neutral-100"}`} onClick={handleSelect}>
            <span className="flex items-center gap-2 w-full">
              <div className="w-4 h-px bg-neutral-200 " />

                <span className={"text-xs"}>
                       {relation.additionalInfo?.name ?? relation.toName}
                </span>
            </span>

                        <div className="flex items-center gap-2">
                            {isSelected && (
                                <Eye className="size-4 text-neutral-400" />
                            )}

                            {hasChildren && (
                                <ChevronRight
                                    className={`transition-transform  size-4 text-neutral-400 ${
                                        open ? 'rotate-90' : ''
                                    }`}
                                />
                            )}
                        </div>
                    </SidebarMenuButton>
                </CollapsibleTrigger>

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
