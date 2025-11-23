"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { CaseSidebar } from "@/components/case/sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { useProtectedRoute } from "@/hooks/useProtectedRoute"
import { GripVertical } from "lucide-react"

export default function CasePage() {
  // Protect this route - redirect to /signin if not authenticated
  useProtectedRoute()

  const params = useParams()
  const caseId = params.caseId as string
  const [activeSection, setActiveSection] = React.useState<"questions" | "documents">("questions")

  // ============================================
  // RESIZABLE PANEL STATE AND LOGIC
  // ============================================

  // State: Width of the right panel (in pixels)
  const [rightPanelWidth, setRightPanelWidth] = React.useState(400) // Default: 400px

  // State: Track if user is currently dragging the resize handle
  const [isResizing, setIsResizing] = React.useState(false)

  // Constraints: Minimum and maximum width for right panel
  const MIN_WIDTH = 250  // Minimum width: 250px
  const MAX_WIDTH = 800  // Maximum width: 800px

  // Handler: Start resizing when user clicks on the resize handle
  const startResizing = React.useCallback(() => {
    setIsResizing(true)
  }, [])

  // Handler: Stop resizing when user releases mouse
  const stopResizing = React.useCallback(() => {
    setIsResizing(false)
  }, [])

  // Handler: Update panel width while dragging
  const resize = React.useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        // Calculate new width based on mouse position from right edge
        const newWidth = window.innerWidth - e.clientX

        // Apply constraints: keep width between MIN_WIDTH and MAX_WIDTH
        if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
          setRightPanelWidth(newWidth)
        }
      }
    },
    [isResizing]
  )

  // Effect: Add/remove mouse event listeners for resizing
  React.useEffect(() => {
    if (isResizing) {
      // Add listeners when resizing starts
      window.addEventListener("mousemove", resize)
      window.addEventListener("mouseup", stopResizing)
    } else {
      // Remove listeners when resizing stops
      window.removeEventListener("mousemove", resize)
      window.removeEventListener("mouseup", stopResizing)
    }

    // Cleanup function
    return () => {
      window.removeEventListener("mousemove", resize)
      window.removeEventListener("mouseup", stopResizing)
    }
  }, [isResizing, resize, stopResizing])

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      <CaseSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        caseId={caseId}
      />
      <SidebarInset>
        <div className="flex h-screen">
          {/* ============================================ */}
          {/* MIDDLE SECTION - Main Content Area           */}
          {/* This section takes remaining space (flex-1)  */}
          {/* ============================================ */}
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

              {/* Placeholder content - Replace with actual content */}
              <div className="rounded-lg border border-border bg-card p-8">
                <div className="text-center text-muted-foreground">
                  {activeSection === "questions" ? (
                    <div>
                      <p className="text-lg mb-2">Questions Section</p>
                      <p className="text-sm">Questions content will appear here</p>
                      <p className="text-xs mt-4 text-muted-foreground/50">
                        💡 Tip: Drag the resize handle on the right to adjust panel widths
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg mb-2">Documents Section</p>
                      <p className="text-sm">Documents content will appear here</p>
                      <p className="text-xs mt-4 text-muted-foreground/50">
                        💡 Tip: Drag the resize handle on the right to adjust panel widths
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* RESIZE HANDLE - Draggable divider            */}
          {/* Allows user to adjust panel widths           */}
          {/* ============================================ */}
          <div
            className={`w-1 hover:w-2 bg-border hover:bg-primary/50 cursor-col-resize transition-all flex items-center justify-center group relative ${
              isResizing ? "bg-primary w-2" : ""
            }`}
            onMouseDown={startResizing}
          >
            {/* Visual grip icon - appears on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-primary" />
            </div>
          </div>

          {/* ============================================ */}
          {/* RIGHT SECTION - Resizable Side Panel         */}
          {/* Width controlled by rightPanelWidth state    */}
          {/* Min: 250px, Max: 800px                       */}
          {/* ============================================ */}
          <div
            className="bg-muted/10 overflow-auto"
            style={{ width: `${rightPanelWidth}px` }}
          >
            <div className="p-6">
              {/* Panel header - shows current width for testing */}
              <div className="mb-4 pb-4 border-b border-border">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Right Panel
                </h3>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Current width: {rightPanelWidth}px (Min: {MIN_WIDTH}px, Max: {MAX_WIDTH}px)
                </p>
              </div>

              {/* Placeholder content - Replace with actual content */}
              <div className="rounded-lg border border-border bg-card p-8">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">Right panel content</p>
                  <p className="text-xs mt-2 text-muted-foreground/50">
                    This panel is resizable!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  )
}
