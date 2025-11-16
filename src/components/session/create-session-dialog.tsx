"use client";

import * as React from "react";
import { X, FileText, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { createAppSession } from "@/store/thunk/sessionthunk";
import { fetchDocuments } from "@/store/thunk/documentsthunk";
import type { Document } from "@/store/thunk/documentsthunk";

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSessionDialog({ open, onOpenChange }: CreateSessionDialogProps) {
  const [sessionName, setSessionName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedExistingDocs, setSelectedExistingDocs] = React.useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = React.useState(false);

  const dispatch = useDispatch<AppDispatch>();

  // Get existing documents from Redux store and filter for embed: true
  const { documents } = useSelector((state: RootState) => state.documents);
  const embeddedDocuments = React.useMemo(() =>
    documents.filter(doc => doc.embed === true),
    [documents]
  );

  // Fetch documents when dialog opens
  React.useEffect(() => {
    if (open) {
      dispatch(fetchDocuments());
    }
  }, [open, dispatch]);

  const resetForm = () => {
    setSessionName("");
    setDescription("");
    setSelectedExistingDocs(new Set());
  };

  const handleClose = () => {
    if (!isCreating) {
      resetForm();
      onOpenChange(false);
    }
  };

  const toggleExistingDoc = (docId: string) => {
    setSelectedExistingDocs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionName.trim()) {
      toast.error("Session name is required");
      return;
    }

    if (selectedExistingDocs.size === 0) {
      toast.error("Please select at least one document");
      return;
    }

    setIsCreating(true);

    try {
      // First, create the session
      const resultAction = await dispatch(createAppSession({
        name: sessionName.trim(),
        description: description.trim() || undefined
      }));

      if (createAppSession.fulfilled.match(resultAction)) {
        const newSession = resultAction.payload;
        const sessionId = newSession.id;

        // Update existing documents to associate with this session
        const updatePromises = Array.from(selectedExistingDocs).map(async (docId) => {
          const response = await fetch(`/api/document/update/${docId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData?.message || `Failed to update document ${docId}`);
          }

          return response.json();
        });

        await Promise.all(updatePromises);

        // Refresh documents list
        dispatch(fetchDocuments());

        toast.success(`Session "${sessionName}" created successfully with ${selectedExistingDocs.size} document(s)`);
        resetForm();
        onOpenChange(false);
      } else {
        throw new Error(resultAction.payload as string || "Failed to create session");
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error(error instanceof Error ? error.message : "Failed to create session");
    } finally {
      setIsCreating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-background border rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">Create New Session</h2>
            <p className="text-sm text-muted-foreground">
              Set up a new session with documents
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isCreating}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Session Name Field */}
            <div className="space-y-2">
              <Label htmlFor="sessionName">Session Name *</Label>
              <Input
                id="sessionName"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Enter session name"
                required
                disabled={isCreating}
              />
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter session description (optional)"
                className="w-full min-h-[80px] px-3 py-2 text-sm border border-input bg-background rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                rows={3}
                disabled={isCreating}
              />
            </div>

            {/* Existing Documents Selection */}
            <div className="space-y-2">
              <Label>Select Documents (Embedded) *</Label>
              {embeddedDocuments.length > 0 ? (
                <>
                  <div className="border rounded-lg max-h-64 overflow-y-auto">
                    {embeddedDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className={`
                          flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors
                          ${selectedExistingDocs.has(doc.id) ? "bg-primary/10 border-primary/20" : ""}
                        `}
                        onClick={() => !isCreating && toggleExistingDoc(doc.id)}
                      >
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                          ${selectedExistingDocs.has(doc.id)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30"
                          }
                        `}>
                          {selectedExistingDocs.has(doc.id) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{doc.fileName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedExistingDocs.size} document(s) selected
                  </p>
                </>
              ) : (
                <div className="border rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No embedded documents available. Please upload and embed documents first.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-2 p-6 border-t bg-muted/50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!sessionName.trim() || selectedExistingDocs.size === 0 || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Session...
                </>
              ) : (
                "Create Session"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
