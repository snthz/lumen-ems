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
                                      isLast = false,
                                  }: {
    assetName: string
    relations: TbRelation[]
    isLast?: boolean
}) {
    const [open, setOpen] = React.useState(true)

    const branchLine = [
        "before:absolute before:left-0 before:-top-1 before:w-px before:bg-neutral-200 before:content-['']",
        isLast ? "before:h-5" : "before:bottom-0",
    ].join(" ")

    return (
        <SidebarMenuSubItem className={`pl-0 ${branchLine}`}>
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
                    <SidebarMenuSub className="mx-0 pl-10 pr-0 border-l-0">
                        {relations.map((rel, index) => (
                            <DeviceTreeItem
                                key={`${rel.from.id}-${rel.to.id}`}
                                relation={rel}
                                assetName={assetName}
                                assetId={rel.from.id}
                                isLast={index === relations.length - 1}
                            />
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuSubItem>
    )
}
