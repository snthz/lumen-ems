"use client"

import React from "react"
import {ChevronRight} from "lucide-react"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {CustomerButton} from "@/features/customer/components/customer-button"
import type {CustomerGroupsResponse, CustomerWithRelations} from "@/lib/thingsboard/server/thingsboard.server"

export function NavMain({
                            groups,
                            groupsConfigured,
                        }: {
    groups: CustomerGroupsResponse
    groupsConfigured: boolean
}) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Grupos</SidebarGroupLabel>
            <SidebarMenu>
                {!groupsConfigured ? (
                    <p className="px-2 py-1 text-xs text-neutral-400">Grupos no configurados</p>
                ) : (
                    groups.map((group) => (
                        <CustomerGroupItem key={group.groupId} group={group}/>
                    ))
                )}
            </SidebarMenu>
        </SidebarGroup>
    )
}

function CustomerGroupItem({group}: { group: CustomerGroupsResponse[number] }) {
    const [isOpen, setIsOpen] = React.useState(false)

    const sorted = [...group.customers].sort((a, b) =>
        a.customer.title.localeCompare(b.customer.title)
    )

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        tooltip={group.label}
                        className="cursor-pointer font-medium"
                    >
                        <span className="text-xs">{group.label}</span>
                        <ChevronRight
                            className={`ml-auto size-4 transition-transform text-neutral-500 ${
                                isOpen ? "rotate-90" : ""
                            }`}
                        />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenu className="pl-2">
                        {sorted.map((item) => (
                            <CustomerButton
                                key={item.customer.id.id}
                                customer={item.customer}
                                initialRelations={item.relations}
                                groupLabel={group.label}
                            />
                        ))}
                    </SidebarMenu>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}
