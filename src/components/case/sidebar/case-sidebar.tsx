"use client"

import * as React from "react"
import { FileText, HelpCircle, ChevronLeft, MessageSquare, Eye } from "lucide-react"
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
import { StartSessionButton } from "@/components/case/start-session-button"

interface CaseSidebarProps {
  activeSection: "questions" | "documents"
  onSectionChange: (section: "questions" | "documents") => void
  activeRightSection: "transcription" | "document"
  onRightSectionChange: (section: "transcription" | "document") => void
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
  }
]

export function CaseSidebar({
  activeSection,
  onSectionChange,
  activeRightSection,
  onRightSectionChange,
  caseId
}: CaseSidebarProps) {
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
              {rightSectionItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onRightSectionChange(item.id)}
                    isActive={activeRightSection === item.id}
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
