"use client"

import * as React from "react"
import { FileText, HelpCircle, ChevronLeft, MessageSquare, Eye, AlertTriangle, MessageSquarePlus } from "lucide-react"
import Link from "next/link"

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
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StartSessionButton } from "@/components/case/start-session-button"
import { useAppSelector } from "@/store/hooks"
import type { RootState } from "@/store"

interface CaseSidebarProps {
  activeSection: "questions" | "documents"
  onSectionChange: (section: "questions" | "documents") => void
  activeRightSection: "transcription" | "document" | "redflags" | "followups"
  onRightSectionChange: (section: "transcription" | "document" | "redflags" | "followups") => void
  caseId: string
}

const middleSectionItems = [
  {
    id: "questions" as const,
    title: "Questions",
    icon: HelpCircle
  },
  {
    id: "documents" as const,
    title: "Documents",
    icon: FileText
  }
]

const rightSectionItems = [
  {
    id: "transcription" as const,
    title: "Transcription",
    icon: MessageSquare
  },
  {
    id: "document" as const,
    title: "Document Viewer",
    icon: Eye
  },
  {
    id: "redflags" as const,
    title: "Red Flags",
    icon: AlertTriangle
  },
  {
    id: "followups" as const,
    title: "Follow-ups",
    icon: MessageSquarePlus
  }
]

export function CaseSidebar({
  activeSection,
  onSectionChange,
  activeRightSection,
  onRightSectionChange,
  caseId
}: CaseSidebarProps) {
  // Get unread counts from Redux
  const redFlagsCount = useAppSelector((state: RootState) => state.redFlags?.unreadCount || 0)
  const followUpsCount = useAppSelector((state: RootState) => state.followUps?.unreadCount || 0)

  // Get notification counts for each section
  const getNotificationCount = (sectionId: string): number => {
    switch (sectionId) {
      case 'redflags':
        return redFlagsCount
      case 'followups':
        return followUpsCount
      default:
        return 0
    }
  }

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          asChild
        >
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Cases</span>
          </Link>
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4">
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {middleSectionItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={activeSection === item.id}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel>Right Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {rightSectionItems.map((item) => {
                const count = getNotificationCount(item.id)
                const showBadge = count > 0 && activeRightSection !== item.id

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onRightSectionChange(item.id)}
                      isActive={activeRightSection === item.id}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {showBadge && (
                        <Badge
                          className="ml-auto h-5 min-w-5 px-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs animate-pulse"
                        >
                          {count}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel>Live Session</SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <StartSessionButton />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border px-4 py-4">
        <div className="text-xs text-sidebar-foreground/60">
          Case ID: {caseId}
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
