'use client'

import React from 'react'
import {
    TbCustomerDto,
    TbRelation, TbRelationsResponse,
} from '@/lib/thingsboard/thingsboard.types'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { ChevronRight } from 'lucide-react'
import { getCustomerRelationsAction } from '@/lib/thingsboard/actions/customer-relations.actions'
import { Spinner } from '@/components/ui/spinner'
import { AssetTreeItem } from '@/features/asset/components/asset-tree-item'

export function CustomerButton({
                                   customer,
                                   groupLabel,
                               }: {
    customer: TbCustomerDto
    groupLabel?: string
}) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [relations, setRelations] = React.useState<TbRelation[] | null>(null)
    const [loading, setLoading] = React.useState(false)

    async function handleToggle(open: boolean) {
        setIsOpen(open)

        if (open && relations === null) {
            setLoading(true)
            const data:TbRelationsResponse = await getCustomerRelationsAction(customer.id.id, customer.id.entityType as 'CUSTOMER' | 'ASSET')
            setRelations(data)
            setLoading(false)
        }
    }

    const assetRelations =
        relations?.filter(rel => rel.to.entityType === 'ASSET' || rel.to.entityType === 'CUSTOMER') || []

    const hasAssets = assetRelations.length > 0

    return (
        <Collapsible open={isOpen} onOpenChange={handleToggle}>
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

                        {loading ? (
                            <Spinner className="text-neutral-500 size-3" />
                        ) : (
                            <ChevronRight
                                className={`transition-transform text-neutral-500 ${
                                    isOpen ? 'rotate-90' : ''
                                }`}
                            />
                        )}
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <SidebarMenuSub className="pl-0">
                    {!loading && hasAssets &&
                        assetRelations.map(rel => (
                            <AssetTreeItem
                                key={`${rel.from.id}-${rel.to.id}`}
                                relation={rel}
                                groupLabel={groupLabel}
                            />
                        ))}

                    {!loading && !hasAssets && (
                        <SidebarMenuSubItem>
                            <SidebarMenuButton
                                disabled
                                className="text-xs pl-0 text-neutral-400 cursor-default"
                            >
                                <div className="w-4 h-px bg-neutral-200" />
                                Sin sitios asociados
                            </SidebarMenuButton>
                        </SidebarMenuSubItem>
                    )}
                </SidebarMenuSub>
            </CollapsibleContent>
        </Collapsible>
    )
}
