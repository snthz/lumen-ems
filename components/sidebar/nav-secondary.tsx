"use client"

import * as React from "react"
import Link from "next/link"
import { CircleQuestionMark, Settings, BookOpen } from "lucide-react"
import { useSessionStore } from "@/lib/auth/store/session.store"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  ...props
}: {} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const user = useSessionStore((s) => s.user)
  const isTenantAdmin = user?.scopes?.includes("TENANT_ADMIN")

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {isTenantAdmin && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton size="sm" asChild>
                  <Link href="/settings">
                    <Settings />
                    <span>Configuración</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="sm" asChild>
                  <Link href="/onboarding">
                    <BookOpen />
                    <span>Guía de configuración</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton size="sm">
              <CircleQuestionMark />
              <span>Obtener ayuda</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
