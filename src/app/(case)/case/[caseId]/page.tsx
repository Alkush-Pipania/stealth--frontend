"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { CaseSidebar } from "@/components/case/sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { useProtectedRoute } from "@/hooks/useProtectedRoute"
import { GripVertical } from "lucide-react"
import { DataTable } from "@/components/documents"
import { RootState, AppDispatch } from "@/store"
import { fetchCaseDocuments } from "@/store/thunk/documentsthunk"

export default function CasePage() {
  // Protect this route - redirect to /signin if not authenticated
  useProtectedRoute()

  const params = useParams()
  const caseId = params.caseId as string
  const dispatch = useDispatch<AppDispatch>()
  const [activeSection, setActiveSection] = React.useState<"questions" | "documents">("questions")

  // ============================================
  // DOCUMENTS STATE - From Redux
  // ============================================
  const { documents, loading: documentsLoading, error: documentsError } = useSelector(
    (state: RootState) => state.documents
  )

  // Fetch documents when Documents section is active
  React.useEffect(() => {
    if (activeSection === "documents" && caseId) {
      dispatch(fetchCaseDocuments(caseId))
    }
  }, [activeSection, caseId, dispatch])

  // Handler: Refresh documents
  const handleRefreshDocuments = React.useCallback(() => {
    if (caseId) {
      dispatch(fetchCaseDocuments(caseId))
    }
  }, [caseId, dispatch])

  // ============================================
  // RESIZABLE PANEL STATE AND LOGIC
  // ============================================

  // State: Width of the right panel (in pixels)
  const [rightPanelWidth, setRightPanelWidth] = React.useState(400) // Default: 400px

  // State: Track if user is currently dragging the resize handle
  const [isResizing, setIsResizing] = React.useState(false)

  // Constraints: Minimum and maximum width for panels
  const MIN_RIGHT_WIDTH = 250    // Minimum width for right panel: 250px
  const MIN_MIDDLE_WIDTH = 300   // Minimum width for middle section: 300px
  // Max width = window width - min middle width - sidebar width (approximately 280px for left sidebar)
  const SIDEBAR_WIDTH = 280      // Approximate left sidebar width

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

        // Calculate maximum width (leave minimum space for middle section)
        const maxWidth = window.innerWidth - MIN_MIDDLE_WIDTH - SIDEBAR_WIDTH

        // Apply constraints:
        // - Right panel must be at least MIN_RIGHT_WIDTH
        // - Right panel cannot exceed maxWidth (to preserve minimum middle section width)
        if (newWidth >= MIN_RIGHT_WIDTH && newWidth <= maxWidth) {
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
              {/* Section Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-semibold">
                  {activeSection === "questions" ? "Questions" : "Documents"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeSection === "questions"
                    ? "View and manage case questions"
                    : "Manage and organize documents for this case"}
                </p>
              </div>

              {/* Content Area - Shows different content based on active section */}
              {activeSection === "questions" ? (
                // ============================================
                // QUESTIONS SECTION - Placeholder for now
                // ============================================
                <div className="rounded-lg border border-border bg-card p-8">
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg mb-2">Questions Section</p>
                    <p className="text-sm">Questions content will appear here</p>
                    <p className="text-xs mt-4 text-muted-foreground/50">
                      💡 Tip: Drag the resize handle on the right to adjust panel widths
                    </p>
                  </div>
                </div>
              ) : (
                // ============================================
                // DOCUMENTS SECTION - Full document management
                // Shows: Document table, upload dialog, search, etc.
                // ============================================
                <div className="space-y-4">
                  {/* Error message if documents failed to load */}
                  {documentsError && (
                    <div className="rounded-md bg-destructive/15 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-destructive">
                            Error loading documents
                          </h3>
                          <div className="mt-2 text-sm text-destructive">
                            {documentsError}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Documents DataTable with upload functionality */}
                  <DataTable
                    data={documents}
                    isLoading={documentsLoading}
                    onRefresh={handleRefreshDocuments}
                    sessionId={caseId}
                    caseId={caseId} // Pass caseId for automatic case selection in upload dialog
                  />
                </div>
              )}
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
          {/* Min: 250px, Max: Dynamic (window - 300px - sidebar) */}
          {/* Can slide almost all the way to the left!    */}
          {/* ============================================ */}
          <div
            className="bg-muted/10 overflow-auto"
            style={{ width: `${rightPanelWidth}px` }}
          >
            <div className="p-6">
              {/* Panel header - shows current width for testing */}
              <div className="mb-4 pb-4 border-b border-border">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Right Panel (Resizable)
                </h3>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Width: {rightPanelWidth}px
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Min: {MIN_RIGHT_WIDTH}px | Max: {typeof window !== 'undefined' ? window.innerWidth - MIN_MIDDLE_WIDTH - SIDEBAR_WIDTH : 'calculating...'}px
                </p>
                <p className="text-xs text-muted-foreground/50 mt-2">
                  💡 Drag left to expand, almost to the edge!
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
