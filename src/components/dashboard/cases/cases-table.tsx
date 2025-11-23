"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState, AppDispatch } from "@/store";
import { fetchCases } from "@/store/thunk/casesthunk";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { FileText } from "lucide-react";

// Status badge component
function CaseStatus({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'closed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Badge variant="secondary" className={`text-xs font-medium ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function CasesTable() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { cases, loading, error } = useSelector((state: RootState) => state.cases);

  useEffect(() => {
    dispatch(fetchCases());
  }, [dispatch]);

  // Handler: Navigate to case page when row is clicked
  const handleCaseClick = (caseId: string) => {
    router.push(`/case/${caseId}`);
  };

  if (loading) {
    return (
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="h-12 px-4 font-semibold">Title</TableHead>
              <TableHead className="h-12 px-4 font-semibold">Description</TableHead>
              <TableHead className="h-12 px-4 font-semibold w-[180px]">Jurisdiction</TableHead>
              <TableHead className="h-12 px-4 font-semibold w-[120px]">Status</TableHead>
              <TableHead className="h-12 px-4 font-semibold w-[140px]">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="border-b">
                <TableCell className="py-4 px-4">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-[200px]" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <Skeleton className="h-4 w-[300px]" />
                </TableCell>
                <TableCell className="py-4 px-4">
                  <Skeleton className="h-4 w-[120px]" />
                </TableCell>
                <TableCell className="py-4 px-4">
                  <Skeleton className="h-5 w-[70px]" />
                </TableCell>
                <TableCell className="py-4 px-4">
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Error loading cases: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b">
            <TableHead className="h-12 px-4 font-semibold">Title</TableHead>
            <TableHead className="h-12 px-4 font-semibold">Description</TableHead>
            <TableHead className="h-12 px-4 font-semibold w-[180px]">Jurisdiction</TableHead>
            <TableHead className="h-12 px-4 font-semibold w-[120px]">Status</TableHead>
            <TableHead className="h-12 px-4 font-semibold w-[140px]">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-48 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <FileText className="h-12 w-12 text-muted-foreground/50" />
                  <div>
                    <div className="text-base font-medium text-muted-foreground">No cases available</div>
                    <div className="text-sm text-muted-foreground/70 mt-1">
                      Create your first case to get started
                    </div>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            cases.map((caseItem) => (
              <TableRow
                key={caseItem.id}
                onClick={() => handleCaseClick(caseItem.id)}
                className="group hover:bg-muted/30 transition-colors cursor-pointer border-b"
              >
                <TableCell className="py-4 px-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-base">{caseItem.title}</span>
                    <span className="text-xs text-muted-foreground/70 font-mono">
                      ID: {caseItem.id.slice(0, 8)}...
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <div className="max-w-[400px] line-clamp-2 text-sm text-muted-foreground" title={caseItem.description || undefined}>
                    {caseItem.description || <span className="italic">No description</span>}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <span className="text-sm">
                    {caseItem.jurisdiction || <span className="text-muted-foreground italic">N/A</span>}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <CaseStatus status={caseItem.status} />
                </TableCell>
                <TableCell className="py-4 px-4">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(caseItem.createdAt)}
                  </span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {cases.length > 0 && (
        <div className="px-4 py-3 text-xs text-muted-foreground border-t bg-muted/20">
          Showing {cases.length} case{cases.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
