'use client'

import React from 'react'
import {TbCustomerDto, TbRelation} from '@/lib/thingsboard/thingsboard.types'
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
import {ChevronRight} from 'lucide-react'
import {getCustomerRelationsAction} from "@/lib/thingsboard/actions/customer-relations.actions";
import {Spinner} from "@/components/ui/spinner";

export function CustomerButton({customer}: { customer: TbCustomerDto }) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [relations, setRelations] = React.useState<TbRelation[] | null>(null)
    const [loading, setLoading] = React.useState(false)

    async function handleToggle(open: boolean) {
        setIsOpen(open)
        if (open) {

            setLoading(true)
            const data = await getCustomerRelationsAction(customer.id.id)
            console.log("Relations for customer", customer.id.id, data)
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
                            <span>
                                {customer.title}</span>
                        </div>

                        {loading?<Spinner  className={"text-neutral-500 size-1"}/> : <ChevronRight
                            className={`transition-transform text-neutral-500 ${
                                isOpen ? 'rotate-90' : ''
                            }`}
                        />}

                    </SidebarMenuButton>
                </SidebarMenuItem>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <SidebarMenuSub className={"pl-0"}>
                    {!loading &&
                        relations?.map(rel => (
                            <SidebarMenuSubItem className={"pl-0"}  key={`${rel.from.id}-${rel.to.id}`}>
                                <SidebarMenuButton className={"pl-0"}>
                                    <span className={"flex items-center gap-2 w-full"}>
                                        <div className="flex items-center gap-2 w-4 h-[.1em] bg-neutral-300"></div>
                                        { rel.toName ?? rel.to.id}</span>
                                </SidebarMenuButton>
                            </SidebarMenuSubItem>
                        ))}
                </SidebarMenuSub>
            </CollapsibleContent>
        </Collapsible>
    )
}
