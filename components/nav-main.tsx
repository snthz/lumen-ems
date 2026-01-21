"use client"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
} from "@/components/ui/sidebar"
import {TbCustomersResponse} from "@/lib/thingsboard/thingsboard.types";
import {CustomerButton} from "@/features/customer/components/customer-button";

export function NavMain({
                            customers,
                        }: {
    customers: TbCustomersResponse
}) {

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Grupos</SidebarGroupLabel>
            <SidebarMenu>
                {customers
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((customer) => (
                        <CustomerButton key={customer.id.id} customer={customer}/>
                    ))}
            </SidebarMenu>
        </SidebarGroup>
    )
}
