"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  Briefcase,
  Settings,
  User
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"


const menuItems = [
  {
    title: "Cases",
    url: "/dashboard",
    icon: Briefcase
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    subItems: [
      {
        title: "Profile",
        url: "/dashboard/settings/profile"
      },
      {
        title: "Preferences",
        url: "/dashboard/settings/preferences"
      }
    ]
  },
]

export function MainSidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = React.useState<string[]>(["Usage", "Settings"])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isActive = (url: string) => {
    // For exact dashboard route, only match exactly
    if (url === "/dashboard") {
      return pathname === "/dashboard"
    }
    // For other routes, check exact match or sub-routes
    return pathname === url || pathname.startsWith(url + "/")
  }

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-6 py-3.5">
        <div className="flex items-center gap-2">
          <Image src="/2alabs.png" alt="logo" draggable="false" width={100} height={100} />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4">
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                {item.subItems ? (
                  <>
                    <SidebarMenuButton
                      onClick={() => toggleExpanded(item.title)}
                      isActive={isActive(item.url)}
                      className="w-full justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      <ChevronDown 
                        className={`h-4 w-4 transition-transform duration-200 ${
                          expandedItems.includes(item.title) ? "rotate-180" : ""
                        }`} 
                      />
                    </SidebarMenuButton>
                    {expandedItems.includes(item.title) && (
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton 
                              asChild
                              isActive={isActive(subItem.url)}
                            >
                              <Link href={subItem.url}>
                                {subItem.title}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </>
                ) : (
                  <SidebarMenuButton 
                    asChild
                    isActive={isActive(item.url)}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-4">
        <div className="space-y-2">
          {/* Profile Section */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-sidebar-accent/50">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                Alkush Pipania
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                alkush@2alabs.com
              </p>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="group-data-[collapsible=icon]:hidden">
            <ThemeToggle />
          </div>

          {/* Copyright */}
          <div className="text-xs text-sidebar-foreground/60 text-center pt-2 group-data-[collapsible=icon]:hidden">
            © 2025 2alabs
          </div>
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}