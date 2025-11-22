"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { CaseSidebar } from "@/components/case/sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { useProtectedRoute } from "@/hooks/useProtectedRoute"

export default function CasePage() {
  // Protect this route - redirect to /signin if not authenticated
  useProtectedRoute()

  const params = useParams()
  const caseId = params.caseId as string
  const [activeSection, setActiveSection] = React.useState<"questions" | "documents">("questions")

  return (
    <>
      <CaseSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        caseId={caseId}
      />
      <SidebarInset>
        <div className="flex h-screen">
          {/* Middle Section - Content Area */}
          <div className="flex-1 overflow-auto border-r border-border">
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold">
                  {activeSection === "questions" ? "Questions" : "Documents"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeSection === "questions"
                    ? "View and manage case questions"
                    : "View and manage case documents"}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-8">
                <div className="text-center text-muted-foreground">
                  {activeSection === "questions" ? (
                    <div>
                      <p className="text-lg mb-2">Questions Section</p>
                      <p className="text-sm">Questions content will appear here</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg mb-2">Documents Section</p>
                      <p className="text-sm">Documents content will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Empty for now */}
          <div className="w-80 bg-muted/10 overflow-auto">
            <div className="p-6">
              <div className="rounded-lg border border-border bg-card p-8">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">Right panel - Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  )
}
