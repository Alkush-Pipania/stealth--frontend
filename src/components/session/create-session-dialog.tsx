"use client";

import * as React from "react";
import { X, Upload, FileText, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { createAppSession } from "@/store/thunk/sessionthunk";
import { fetchDocuments } from "@/store/thunk/documentsthunk";

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SelectedFile {
  file: File;
  name: string;
  id: string;
}

export function CreateSessionDialog({ open, onOpenChange }: CreateSessionDialogProps) {
  const [sessionName, setSessionName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedFiles, setSelectedFiles] = React.useState<SelectedFile[]>([]);
  const [isCreating, setIsCreating] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setSessionName("");
    setDescription("");
    setSelectedFiles([]);
  };

  const handleClose = () => {
    if (!isCreating) {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    const validFiles: SelectedFile[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach((file) => {
      if (allowedTypes.includes(file.type)) {
        // Check if file is already selected
        const exists = selectedFiles.some(sf =>
          sf.file.name === file.name && sf.file.size === file.size
        );

        if (!exists) {
          validFiles.push({
            file,
            name: file.name.replace(/\.[^/.]+$/, ""),
            id: `${Date.now()}-${Math.random()}`
          });
        }
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`Invalid file types: ${invalidFiles.join(", ")}. Only PDF and PowerPoint files are allowed.`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input to allow selecting the same file again
    e.target.value = '';
  };

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  }, [selectedFiles]);

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFileName = (id: string, newName: string) => {
    setSelectedFiles(prev =>
      prev.map(f => f.id === id ? { ...f, name: newName } : f)
    );
  };

  const formatFileSize = (bytes: number): string => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionName.trim()) {
      toast.error("Session name is required");
      return;
    }

    if (selectedFiles.length === 0) {
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

        // Upload all documents
        const uploadPromises = selectedFiles.map(async (selectedFile) => {
          const formData = new FormData();
          formData.append("file", selectedFile.file);
          formData.append("name", selectedFile.name);
          formData.append("sessionId", sessionId);

          const response = await fetch("/api/document/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData?.message || `Failed to upload ${selectedFile.file.name}`);
          }

          return response.json();
        });

        await Promise.all(uploadPromises);

        // Refresh documents list
        dispatch(fetchDocuments());

        toast.success(`Session "${sessionName}" created successfully with ${selectedFiles.length} document(s)`);
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

            {/* File Upload Area */}
            <div className="space-y-2">
              <Label>Documents * (at least one required)</Label>
              <div
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
                  ${selectedFiles.length > 0 ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50"}
                  ${isCreating ? "opacity-50 cursor-not-allowed" : ""}
                `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !isCreating && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileInputChange}
                  accept=".pdf,.ppt,.pptx"
                  multiple
                  disabled={isCreating}
                />

                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <div className="space-y-1">
                  <p className="font-medium">Drop your files here or click to browse</p>
                  <p className="text-sm text-muted-foreground">
                    PDF and PowerPoint files only (max 10MB each)
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Documents ({selectedFiles.length})</Label>
                <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                  {selectedFiles.map((selectedFile) => (
                    <div key={selectedFile.id} className="p-3 flex items-start gap-3">
                      <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <Input
                          value={selectedFile.name}
                          onChange={(e) => updateFileName(selectedFile.id, e.target.value)}
                          placeholder="Document name"
                          className="h-8"
                          disabled={isCreating}
                        />
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="truncate">{selectedFile.file.name}</span>
                          <span>•</span>
                          <span>{formatFileSize(selectedFile.file.size)}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => removeFile(selectedFile.id)}
                        disabled={isCreating}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              disabled={!sessionName.trim() || selectedFiles.length === 0 || isCreating}
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
