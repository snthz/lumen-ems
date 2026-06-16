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
import { ChevronRight } from 'lucide-react'
import { SelectedDevice, useDeviceStore } from '@/features/devices/store/device.store'
import clsx from 'clsx'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

export function DeviceTreeItem({
                                   relation,
                                   assetId,
                                   assetName,
                                   isLast = false,
                               }: {
    relation: TbRelation
    assetId: string
    assetName: string
    isLast?: boolean
}) {
    const deviceChildren =
        relation.children?.filter(
            child => child.to.entityType === 'DEVICE'
        ) ?? []

    const hasChildren = deviceChildren.length > 0
    const [open, setOpen] = React.useState(false)

    const toggleDevice = useDeviceStore(state => state.toggleDevice)

    const deviceId = relation.to.id

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

    const branchLine = clsx(
        "before:absolute before:left-0 before:-top-1 before:w-px before:bg-neutral-200 before:content-['']",
        isLast ? "before:h-5" : "before:bottom-0"
    )

    return (
        <SidebarMenuSubItem className={clsx("pl-0", branchLine)}>
            <Collapsible open={open} onOpenChange={setOpen}>
                <div
                    className="flex items-center justify-between pl-0 cursor-pointer rounded-none"
                >
                    <SidebarMenuButton
                        className="pl-0 flex-1 min-w-0 cursor-pointer rounded-none"
                        onClick={handleSelect}
                    >
                        <span className="flex items-center gap-2 w-full min-w-0">
                            <div className="w-4 h-px bg-neutral-200 shrink-0" />
                            <Checkbox
                                checked={isSelected}
                                tabIndex={-1}
                                className="pointer-events-none shrink-0"
                            />
                            <span className="text-xs wrap-break-word whitespace-normal leading-tight">
                                {relation.additionalInfo?.name ?? relation.toName}
                            </span>
                        </span>
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
                        <SidebarMenuSub className="mx-0 pl-2 pr-0 border-l-0">
                            {deviceChildren.map((child, index) => (
                                <DeviceTreeItem
                                    key={`${child.from.id}-${child.to.id}`}
                                    relation={child}
                                    assetId={assetId}
                                    assetName={assetName}
                                    isLast={index === deviceChildren.length - 1}
                                />
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                )}
            </Collapsible>
        </SidebarMenuSubItem>
    )
}