"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { NavMain } from "@/components/sidebar/nav-main"
import { NavSecondary } from "@/components/sidebar/nav-secondary"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboard } from "lucide-react"
import type {CustomerGroupsResponse} from "@/lib/thingsboard/server/thingsboard.server";
import { useBranding } from "@/lib/branding/branding.provider"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  groups: CustomerGroupsResponse
}
export function AppSidebar({ groups, ...props }: AppSidebarProps) {
  const { branding } = useBranding()
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-10 items-center justify-center rounded-lg overflow-hidden border bg-neutral-100">
                  <Image src={branding.sidebarLogoUrl} alt={`${branding.appName} Logo`} width={40} height={40} className="size-10 object-contain" unoptimized={branding.sidebarLogoUrl.startsWith("/api/")} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{branding.appName}</span>
                  <span className="truncate text-xs">{branding.appSubtitle}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="sm" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="size-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavMain groups={groups} />
        <NavSecondary className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
    </Sidebar>
  )
}
