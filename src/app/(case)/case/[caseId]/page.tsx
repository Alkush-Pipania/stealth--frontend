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
import { fetchCaseQuestions } from "@/store/thunk/questionsthunk"
import { LiveTranscript } from "@/components/case/live-transcript"
import { CreateQuestionDialog } from "@/components/case/create-question-dialog"

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

  // ============================================
  // QUESTIONS STATE - From Redux
  // ============================================
  const { questions, loading: questionsLoading, error: questionsError } = useSelector(
    (state: RootState) => state.questions
  )

  // Fetch documents when Documents section is active
  React.useEffect(() => {
    if (activeSection === "documents" && caseId) {
      dispatch(fetchCaseDocuments(caseId))
    }
  }, [activeSection, caseId, dispatch])

  // Fetch questions when Questions section is active
  React.useEffect(() => {
    if (activeSection === "questions" && caseId) {
      dispatch(fetchCaseQuestions(caseId))
    }
  }, [activeSection, caseId, dispatch])

  // Handler: Refresh documents
  const handleRefreshDocuments = React.useCallback(() => {
    if (caseId) {
      dispatch(fetchCaseDocuments(caseId))
    }
  }, [caseId, dispatch])

  // Handler: Refresh questions
  const handleRefreshQuestions = React.useCallback(() => {
    if (caseId) {
      dispatch(fetchCaseQuestions(caseId))
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
              {/* Content Area - Shows different content based on active section */}
              {activeSection === "questions" ? (
                // QUESTIONS SECTION
                <div className="space-y-4">
                  {/* Header with Add Question button */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Questions</h2>
                    <CreateQuestionDialog
                      caseId={caseId}
                      onQuestionCreated={handleRefreshQuestions}
                    />
                  </div>

                  {/* Error message if questions failed to load */}
                  {questionsError && (
                    <div className="rounded-md bg-destructive/15 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-destructive">
                            Error loading questions
                          </h3>
                          <div className="mt-2 text-sm text-destructive">
                            {questionsError}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Loading state */}
                  {questionsLoading && (
                    <div className="text-center text-muted-foreground py-8">
                      <p>Loading questions...</p>
                    </div>
                  )}

                  {/* Questions list */}
                  {!questionsLoading && questions.length === 0 && (
                    <div className="rounded-lg border border-border bg-card p-8">
                      <div className="text-center text-muted-foreground">
                        <p className="text-lg mb-2">No questions yet</p>
                        <p className="text-sm">Click "Add Question" to create your first question</p>
                      </div>
                    </div>
                  )}

                  {!questionsLoading && questions.length > 0 && (
                    <div className="space-y-3">
                      {questions.map((question) => (
                        <div
                          key={question.id}
                          className="rounded-lg border border-border bg-card p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                          onClick={() => {
                            // TODO: Handle question click
                            console.log("Question clicked:", question.id)
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {/* Priority badge */}
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                                {question.priority}
                              </span>
                            </div>

                            {/* Question content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-medium mb-2">
                                {question.text}
                              </p>

                              {/* Rationale */}
                              {question.rationale && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {question.rationale}
                                </p>
                              )}

                              {/* Metadata */}
                              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                {question.documentId && (
                                  <span>
                                    📄 Document attached
                                  </span>
                                )}
                                {question.pageNumber && (
                                  <span>
                                    Page {question.pageNumber}
                                  </span>
                                )}
                                {question.linkedChunkIds && question.linkedChunkIds.length > 0 && (
                                  <span>
                                    🔗 {question.linkedChunkIds.length} linked chunk{question.linkedChunkIds.length > 1 ? 's' : ''}
                                  </span>
                                )}
                                <span>
                                  {new Date(question.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
          {/* RIGHT SECTION - Live Transcript Panel        */}
          {/* Takes up 50% of the width                    */}
          {/* ============================================ */}
          <div className="w-1/2 overflow-hidden">
            <LiveTranscript />
          </div>
        </div>
      </SidebarInset>
    </>
  )
}
