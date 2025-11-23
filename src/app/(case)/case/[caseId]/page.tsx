"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { CaseSidebar } from "@/components/case/sidebar"
import { SidebarInset } from "@/components/ui/sidebar"
import { useProtectedRoute } from "@/hooks/useProtectedRoute"
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
          {/* Takes up 50% of the width                    */}
          {/* ============================================ */}
          <div className="w-1/2 overflow-auto border-r border-border">
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
                // QUESTIONS SECTION - Placeholder for now
                <div className="rounded-lg border border-border bg-card p-8">
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg mb-2">Questions Section</p>
                    <p className="text-sm">Questions content will appear here</p>
                  </div>
                </div>
              ) : (
                // DOCUMENTS SECTION - Full document management
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
                    caseId={caseId}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ============================================ */}
          {/* DIVIDER - Fixed separator between sections   */}
          {/* ============================================ */}
          <div className="w-px bg-border" />

          {/* ============================================ */}
          {/* RIGHT SECTION - Side Panel                   */}
          {/* Takes up 50% of the width                    */}
          {/* ============================================ */}
          <div className="w-1/2 bg-muted/10 overflow-auto">
            <div className="p-6">
              {/* Placeholder content */}
              <div className="rounded-lg border border-border bg-card p-8">
                <div className="text-center text-muted-foreground">
                  <p className="text-sm">Right panel content</p>
                  <p className="text-xs mt-2 text-muted-foreground/50">
                    Coming soon
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
