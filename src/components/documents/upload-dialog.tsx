"use client";

import * as React from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiGet, apiPost, tokenManager } from "@/action/server";
import { API_ENDPOINTS } from "@/action/endpoint";

interface Case {
  id: string;
  title: string;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId?: string;
  caseId?: string; // Optional: If provided, skip case selection
}

export function UploadDialog({ open, onOpenChange, sessionId, caseId }: UploadDialogProps) {
  const [name, setName] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedCase, setSelectedCase] = React.useState<string>("");
  const [cases, setCases] = React.useState<Case[]>([]);
  const [loadingCases, setLoadingCases] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Set selectedCase to caseId if provided
  React.useEffect(() => {
    if (caseId) {
      setSelectedCase(caseId);
    }
  }, [caseId]);

  // Fetch cases when dialog opens (only if caseId not provided)
  React.useEffect(() => {
    if (open && !caseId) {
      fetchCases();
    }
  }, [open, caseId]);

  const fetchCases = async () => {
    setLoadingCases(true);
    try {
      const response = await apiGet<{ cases: Case[] }>(API_ENDPOINTS.GET_CASES, {
        includeAuth: true,
      });

      if (response.success && response.data?.cases) {
        setCases(response.data.cases);
      } else {
        toast.error("Failed to fetch cases");
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
      toast.error("Failed to load cases");
    } finally {
      setLoadingCases(false);
    }
  };

  const resetForm = () => {
    setName("");
    setFile(null);
    setSelectedCase("");
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Only PDF and PowerPoint files are allowed.");
      return;
    }
    
    setFile(selectedFile);
    if (!name && selectedFile.name) {
      // Auto-populate name with filename (without extension)
      const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, "");
      setName(nameWithoutExtension);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !name.trim() || !selectedCase) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsUploading(true);

    try {
      // Get userId from localStorage
      const userId = tokenManager.getUserId();
      if (!userId) {
        toast.error("User not authenticated");
        setIsUploading(false);
        return;
      }

      // Step 1: Get presigned URL from backend
      const presignResponse = await apiPost<{
        document_id: string;
        upload_url: string;
        expires_in: number;
      }>(API_ENDPOINTS.PRESIGN_UPLOAD(selectedCase), {
        body: {
          filename: file.name,
          content_type: file.type,
          size_bytes: file.size,
          userId: userId,
        },
        includeAuth: true,
      });

      if (!presignResponse.success || !presignResponse.data?.upload_url) {
        toast.error("Failed to get upload URL");
        setIsUploading(false);
        return;
      }

      const { upload_url, document_id } = presignResponse.data;

      // Step 2: Upload file to R2 using presigned URL
      // Note: Don't set Content-Type header to avoid CORS preflight
      // The presigned URL already includes the content type
      const uploadResponse = await fetch(upload_url, {
        method: "PUT",
        body: file,
      });

      if (!uploadResponse.ok) {
        toast.error("Failed to upload file to storage");
        setIsUploading(false);
        return;
      }

      // Success!
      toast.success("Document uploaded successfully!");
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-background border rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">Upload Document</h2>
            <p className="text-sm text-muted-foreground">
              Add a new document to your collection
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* File Upload Area */}
          <div className="space-y-2">
            <Label>File</Label>
            <div
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
                ${file ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50"}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileInputChange}
                accept=".pdf,.ppt,.pptx"
              />
              
              {file ? (
                <div className="space-y-2">
                  <FileText className="h-8 w-8 mx-auto text-primary" />
                  <div className="space-y-1">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setName("");
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="font-medium">Drop your file here</p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Only PDF and PowerPoint files are supported
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Case Selection - Only show if caseId not provided */}
          {!caseId && (
            <div className="space-y-2">
              <Label htmlFor="case">Case *</Label>
              <Select value={selectedCase} onValueChange={setSelectedCase}>
                <SelectTrigger id="case">
                  <SelectValue placeholder={loadingCases ? "Loading cases..." : "Select a case"} />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((caseItem) => (
                    <SelectItem key={caseItem.id} value={caseItem.id}>
                      {caseItem.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter document name"
              required
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || !name.trim() || !selectedCase || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
