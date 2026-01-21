"use client"

import {ChevronRight, type LucideIcon} from "lucide-react"

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {TbCustomersResponse} from "@/lib/thingsboard/thingsboard.types";

export function NavMain({
                            items,
                            customers,
                        }: {
    customers: TbCustomersResponse
    items: {
        title: string
        url: string
        icon: LucideIcon
        isActive?: boolean
        items?: {
            title: string
            url: string
        }[]
    }[]
}) {
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Grupos</SidebarGroupLabel>
            <SidebarMenu>
                {customers
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((customer) => (
                    <SidebarMenuItem key={customer.id.id}>
                        <SidebarMenuButton className={"flex items-center justify-between"} tooltip={customer.title}>
                            <div className={"flex items-center gap-2"}>
                                <div className={"size-3 bg-neutral-200 rounded-md flex items-center justify-center p-3"}>
                                    <span className={"uppercase text-xs"}>{customer.title.charAt(0)}</span>
                                </div>
                                <span>{customer.title}</span>
                            </div>
                            <ChevronRight/>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                {/*{items.map((item) => (*/}
                {/*   <Collapsible key={item.title} asChild defaultOpen={item.isActive}>*/}
                {/*     <SidebarMenuItem>*/}
                {/*       <SidebarMenuButton asChild tooltip={item.title}>*/}
                {/*         <a href={item.url}>*/}
                {/*           <item.icon />*/}
                {/*           <span>{item.title}</span>*/}
                {/*         </a>*/}
                {/*       </SidebarMenuButton>*/}
                {/*       {item.items?.length ? (*/}
                {/*         <>*/}
                {/*           <CollapsibleTrigger asChild>*/}
                {/*             <SidebarMenuAction className="data-[state=open]:rotate-90">*/}
                {/*               <ChevronRight />*/}
                {/*               <span className="sr-only">Toggle</span>*/}
                {/*             </SidebarMenuAction>*/}
                {/*           </CollapsibleTrigger>*/}
                {/*           <CollapsibleContent>*/}
                {/*             <SidebarMenuSub>*/}
                {/*               {item.items?.map((subItem) => (*/}
                {/*                 <SidebarMenuSubItem key={subItem.title}>*/}
                {/*                   <SidebarMenuSubButton asChild>*/}
                {/*                     <a href={subItem.url}>*/}
                {/*                       <span>{subItem.title}</span>*/}
                {/*                     </a>*/}
                {/*                   </SidebarMenuSubButton>*/}
                {/*                 </SidebarMenuSubItem>*/}
                {/*               ))}*/}
                {/*             </SidebarMenuSub>*/}
                {/*           </CollapsibleContent>*/}
                {/*         </>*/}
                {/*       ) : null}*/}
                {/*     </SidebarMenuItem>*/}
                {/*   </Collapsible>*/}
                {/* ))}*/}

            </SidebarMenu>
        </SidebarGroup>
    )
}
