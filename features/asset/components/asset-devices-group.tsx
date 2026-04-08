'use client'

import React from 'react'
import { TbRelation } from '@/lib/thingsboard/thingsboard.types'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { ChevronRight } from 'lucide-react'
import {DeviceTreeItem} from "@/features/devices/components/device-tree-item";

export function AssetDevicesGroup({
                                      assetName,
                                      relations,
                                  }: {
    assetName: string
    relations: TbRelation[]
}) {
    const [open, setOpen] = React.useState(true)

    return (
        <SidebarMenuSubItem className="pl-0">
            <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="pl-0 font-medium rounded-none cursor-pointer">
            <span className="flex items-center gap-2 w-full">
              <div className="w-4 h-px bg-neutral-300 shrink-0" />
                <span className="text-neutral-500 font-normal text-xs wrap-break-word whitespace-normal leading-tight">{assetName}</span>
            </span>

                        <ChevronRight
                            className={`transition-transform text-neutral-400 ${
                                open ? 'rotate-90' : ''
                            }`}
                        />
                    </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <SidebarMenuSub className="pl-0">
                        {relations.map(rel => (
                            <DeviceTreeItem
                                key={`${rel.from.id}-${rel.to.id}`}
                                relation={rel}
                                assetName={assetName}
                                assetId={rel.from.id}
                            />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuSubItem>
    )
}
