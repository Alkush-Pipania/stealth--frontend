"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ExternalLink, Download, Trash2 } from "lucide-react";
import { Document } from "@/store/thunk/documentsthunk";

// Format file size
export const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// Format upload date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};



// Component for rendering document name
export const DocumentNameCell = ({ document }: { document: Document }) => {
  const displayName = document.filename || "Untitled Document";

  return (
    <div className="flex flex-col">
      <span className="font-medium">{displayName}</span>
      {document.contentType && (
        <span className="text-xs text-muted-foreground">{document.contentType}</span>
      )}
    </div>
  );
};

// Component for rendering pages count
export const PagesCell = ({ pages }: { pages: number | null }) => {
  return <span className="text-sm">{pages ? `${pages} pages` : "—"}</span>;
};

// Component for rendering upload date
export const UploadDateCell = ({ uploadedAt }: { uploadedAt: string }) => {
  return <span className="text-sm">{formatDate(uploadedAt)}</span>;
};

// Component for rendering status
export const StatusCell = ({ status }: { status: string }) => {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return "default";
      case "processing":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Badge variant={getStatusVariant(status)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Component for rendering actions
export const ActionsCell = ({ document }: { document: Document }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(document.id)}
        >
          Copy document ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete document
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
