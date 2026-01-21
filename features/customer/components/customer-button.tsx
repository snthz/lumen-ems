'use client'

import React from 'react'
import {
    TbCustomerDto,
    TbRelation,
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
} from '@/components/ui/sidebar'
import { ChevronRight } from 'lucide-react'
import { getCustomerRelationsAction } from '@/lib/thingsboard/actions/customer-relations.actions'
import { Spinner } from '@/components/ui/spinner'
import {AssetTreeItem} from "@/features/asset/components/asset-tree-item";


export function CustomerButton({
                                   customer,
                               }: {
    customer: TbCustomerDto
}) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [relations, setRelations] = React.useState<TbRelation[] | null>(null)
    const [loading, setLoading] = React.useState(false)

    async function handleToggle(open: boolean) {
        setIsOpen(open)

        if (open && relations === null) {
            setLoading(true)
            const data = await getCustomerRelationsAction(customer.id.id)
            setRelations(data)
            setLoading(false)
        }
    }

    return (
        <Collapsible open={isOpen} onOpenChange={handleToggle}>
            <CollapsibleTrigger asChild>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip={customer.title}>
                        <div className="flex items-center gap-2 w-full">
                            <div className="size-6 bg-neutral-200 rounded-md flex items-center justify-center">
                <span className="uppercase text-xs">
                  {customer.title.charAt(0)}
                </span>
                            </div>
                            <span>{customer.title}</span>
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
                    {!loading &&
                        relations
                            ?.filter(rel => rel.to.entityType === 'ASSET')
                            .map(rel => (
                                <AssetTreeItem
                                    key={`${rel.from.id}-${rel.to.id}`}
                                    relation={rel}
                                />
                            ))}
                </SidebarMenuSub>
            </CollapsibleContent>
        </Collapsible>
    )
}
