"use client";

import * as React from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { apiGet, apiPost } from "@/action/server";
import { API_ENDPOINTS } from "@/action/endpoint";

interface Case {
  id: string;
  title: string;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId?: string;
  caseId?: string;
}

interface PersistedFileData {
  name: string;
  selectedCase: string;
  fileData: {
    name: string;
    size: number;
    type: string;
    lastModified: number;
  } | null;
}

const STORAGE_KEY = "upload_dialog_state";

// Store file in module scope for persistence across renders
let persistedFile: File | null = null;

export function UploadDialog({ open, onOpenChange, sessionId, caseId }: UploadDialogProps) {
  const [name, setName] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [selectedCase, setSelectedCase] = React.useState<string>("");
  const [cases, setCases] = React.useState<Case[]>([]);
  const [loadingCases, setLoadingCases] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load persisted state when dialog opens
  React.useEffect(() => {
    if (open) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const data: PersistedFileData = JSON.parse(stored);
          setName(data.name);
          if (!caseId) {
            setSelectedCase(data.selectedCase);
          }
          if (persistedFile) {
            setFile(persistedFile);
          }
        } catch (e) {
          console.error("Failed to load persisted data:", e);
        }
      }
    }
  }, [open, caseId]);

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

  // Persist state when it changes
  React.useEffect(() => {
    if (file || name || selectedCase) {
      const data: PersistedFileData = {
        name,
        selectedCase: caseId || selectedCase,
        fileData: file
          ? {
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
            }
          : null,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      persistedFile = file;
    }
  }, [file, name, selectedCase, caseId]);

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

  const clearPersistedData = () => {
    localStorage.removeItem(STORAGE_KEY);
    persistedFile = null;
    setName("");
    setFile(null);
    if (!caseId) {
      setSelectedCase("");
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      onOpenChange(false);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const allowedTypes = ['application/pdf'];
    const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Only PDF files are allowed.");
      return;
    }

    if (selectedFile.size > MAX_SIZE) {
      toast.error("File size must be less than 20 MB.");
      return;
    }

    setFile(selectedFile);
    if (!name && selectedFile.name) {
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
      const presignResponse = await apiPost<{
        document_id: string;
        upload_url: string;
        expires_in: number;
      }>(API_ENDPOINTS.PRESIGN_UPLOAD(selectedCase), {
        body: {
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        },
        includeAuth: true,
      });

      if (!presignResponse.success || !presignResponse.data?.upload_url) {
        toast.error("Failed to get upload URL");
        setIsUploading(false);
        return;
      }

      const { upload_url, document_id } = presignResponse.data;

      const uploadResponse = await axios.put(upload_url, file, {
        headers: {},
        transformRequest: [(data) => data],
      });

      if (uploadResponse.status !== 200) {
        toast.error("Failed to upload file to storage");
        setIsUploading(false);
        return;
      }

      toast.success("Document uploaded successfully!");
      clearPersistedData();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Upload error:", error);

      if (error.message?.includes("CORS") || error.message?.includes("Failed to fetch")) {
        toast.error("CORS error: Check DigitalOcean Spaces CORS configuration");
      } else if (axios.isAxiosError(error)) {
        toast.error(`Upload failed: ${error.response?.status || "Network error"}`);
      } else {
        toast.error("Failed to upload document");
      }
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
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-background dark:bg-card border dark:border-border rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b dark:border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground dark:text-foreground">Upload Document</h2>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Add a new document to your collection
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="h-8 w-8 rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-foreground dark:text-foreground">File</label>
            <div
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
                ${dragActive ? "border-primary bg-primary/5 dark:bg-primary/10 scale-[0.98]" : "border-muted-foreground/25 dark:border-muted-foreground/20"}
                ${file ? "border-primary bg-primary/5 dark:bg-primary/10" : "hover:border-muted-foreground/50 hover:bg-accent/5 dark:hover:bg-accent/10"}
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
                accept=".pdf"
              />

              {file ? (
                <div className="space-y-2">
                  <FileText className="h-8 w-8 mx-auto text-primary dark:text-primary" />
                  <div className="space-y-1">
                    <p className="font-medium text-foreground dark:text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setName("");
                    }}
                    className="mt-2 px-3 py-1.5 text-sm border dark:border-border rounded-md hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground dark:text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="font-medium text-foreground dark:text-foreground">Drop your file here</p>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      or click to browse
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                    Only PDF files (max 20 MB) are supported
                  </p>
                </div>
              )}
            </div>
          </div>

          {!caseId && (
            <div className="space-y-2">
              <label htmlFor="case" className="text-sm font-medium leading-none text-foreground dark:text-foreground">
                Case <span className="text-destructive dark:text-destructive">*</span>
              </label>
              <div className="relative">
                <select
                  id="case"
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  disabled={loadingCases}
                  className="w-full px-3 py-2 border dark:border-border rounded-md bg-background dark:bg-card text-sm text-foreground dark:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingCases ? "Loading cases..." : "Select a case"}
                  </option>
                  {cases.map((caseItem) => (
                    <option key={caseItem.id} value={caseItem.id}>
                      {caseItem.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none text-foreground dark:text-foreground">
              Name <span className="text-destructive dark:text-destructive">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter document name"
              required
              className="w-full px-3 py-2 border dark:border-border rounded-md bg-background dark:bg-card text-sm text-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 text-sm border dark:border-border rounded-md hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || !name.trim() || !selectedCase || isUploading}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground rounded-md hover:bg-primary/90 dark:hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
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
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
