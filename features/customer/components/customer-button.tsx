'use client'

import React from 'react'
import { TbCustomerDto, TbRelation } from '@/lib/thingsboard/thingsboard.types'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
} from '@/components/ui/sidebar'
import { ChevronRight } from 'lucide-react'
import { AssetTreeItem } from '@/features/asset/components/asset-tree-item'

export function CustomerButton({
                                   customer,
                                   groupLabel,
                                   initialRelations,
                               }: {
    customer: TbCustomerDto
    groupLabel?: string
    initialRelations: TbRelation[]
}) {
    const [isOpen, setIsOpen] = React.useState(false)

    const assetRelations = initialRelations.filter(
        rel => rel.to.entityType === 'ASSET' || rel.to.entityType === 'CUSTOMER'
    )

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        tooltip={customer.title}
                        className="cursor-pointer rounded-none"
                    >
                        <div className="flex items-center gap-2 w-full">
                            <div className="size-6 bg-neutral-200 rounded-md flex items-center justify-center">
                                <span className="uppercase text-xs">
                                    {customer.title.charAt(0)}
                                </span>
                            </div>
                            <span className="text-xs truncate max-w-35" title={customer.title}>{customer.title}</span>
                        </div>
                        <ChevronRight
                            className={`transition-transform text-neutral-500 ${isOpen ? 'rotate-90' : ''}`}
                        />
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <SidebarMenuSub className="pl-0">
                    {assetRelations.map(rel => (
                        <AssetTreeItem
                            key={`${rel.from.id}-${rel.to.id}`}
                            relation={rel}
                            groupLabel={groupLabel}
                        />
                    ))}
                </SidebarMenuSub>
            </CollapsibleContent>
        </Collapsible>
    )
}
