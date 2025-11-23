"use client";

import * as React from "react";
import { Upload, RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DocumentNameCell,
  PagesCell,
  UploadDateCell,
  StatusCell,
  ActionsCell,
} from "./columns";
import { Document } from "@/store/thunk/documentsthunk";
import { UploadDialog } from "./upload-dialog";

interface DataTableProps {
  data: Document[];
  isLoading?: boolean;
  onRefresh?: () => void;
  sessionId?: string;
  caseId?: string; // Optional: If provided, upload dialog will use this case
}

export function DataTable({ data, isLoading = false, onRefresh, sessionId, caseId }: DataTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);

  // Filter documents based on search term
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((document) => {
      const searchLower = searchTerm.toLowerCase();
      const filename = document.filename?.toLowerCase() || "";

      return filename.includes(searchLower);
    });
  }, [data, searchTerm]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-8 max-w-sm"
            />
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Pages</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Loading documents...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length > 0 ? (
              filteredData.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <DocumentNameCell document={document} />
                  </TableCell>
                  <TableCell>
                    <PagesCell pages={document.pages} />
                  </TableCell>
                  <TableCell>
                    <UploadDateCell uploadedAt={document.uploadedAt} />
                  </TableCell>
                  <TableCell>
                    <StatusCell status={document.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <ActionsCell document={document} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      {searchTerm
                        ? "No documents match your search."
                        : "No documents found. Upload your first document to get started."}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredData.length} of {data.length} document(s)
          </div>
        </div>
      )}
      
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        sessionId={sessionId}
        caseId={caseId}
        onUploadSuccess={onRefresh}
      />
    </div>
  );
}
