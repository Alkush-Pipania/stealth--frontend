"use client"

import * as React from "react"
import { X, Loader2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiGet } from "@/action/server"
import { API_ENDPOINTS } from "@/action/endpoint"
import { toast } from "sonner"

interface DocumentViewerProps {
  caseId: string
  documentId: string | null
  pageNumber: number | null
  onClose: () => void
}

export function DocumentViewer({ caseId, documentId, pageNumber, onClose }: DocumentViewerProps) {
  const [documentUrl, setDocumentUrl] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!documentId) {
      setDocumentUrl(null)
      setError(null)
      return
    }

    const fetchDocumentUrl = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiGet<{ message: string; url: string }>(
          API_ENDPOINTS.GET_DOCUMENT_BY_ID(caseId, documentId),
          { includeAuth: true }
        )

        if (response.success && response.data?.url) {
          // If pageNumber is provided, append it as a fragment to the URL
          let finalUrl = response.data.url
          if (pageNumber && pageNumber > 0) {
            finalUrl = `${finalUrl}#page=${pageNumber}`
          }
          setDocumentUrl(finalUrl)
        } else {
          setError(response.error || "Failed to fetch document")
          toast.error(response.error || "Failed to fetch document")
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchDocumentUrl()
  }, [caseId, documentId, pageNumber])

  if (!documentId) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Document Selected</h3>
        <p className="text-sm text-muted-foreground">
          Click on a question with a document to view it here
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-semibold">Document Viewer</h3>
            {pageNumber && (
              <p className="text-xs text-muted-foreground">Page {pageNumber}</p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="flex flex-col h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading document...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col h-full items-center justify-center p-8 text-center">
            <div className="rounded-lg bg-destructive/15 p-4 max-w-md">
              <h3 className="text-sm font-medium text-destructive mb-2">
                Error Loading Document
              </h3>
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        {documentUrl && !loading && !error && (
          <iframe
            src={documentUrl}
            className="w-full h-full border-0"
            title="Document Viewer"
          />
        )}
      </div>
    </div>
  )
}
