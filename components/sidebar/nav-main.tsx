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
import type {CustomerGroupsResponse} from "@/lib/thingsboard/server/thingsboard.server"

export function NavMain({
                            groups,
                        }: {
    groups: CustomerGroupsResponse
}) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Grupos</SidebarGroupLabel>
            <SidebarMenu>
                {groups.map((group) => (
                    <CustomerGroupItem key={group.groupId} group={group}/>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}

function CustomerGroupItem({group}: { group: CustomerGroupsResponse[number] }) {
    const [isOpen, setIsOpen] = React.useState(false)

    const sorted = [...group.customers].sort((a, b) =>
        a.title.localeCompare(b.title)
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
                        {sorted.map((customer) => (
                            <CustomerButton
                                key={customer.id.id}
                                customer={customer}
                                groupLabel={group.label}
                            />
                        ))}
                    </SidebarMenu>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}
