"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
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
import Link from "next/link";

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
  const { cases, loading, error } = useSelector((state: RootState) => state.cases);

  useEffect(() => {
    dispatch(fetchCases());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[150px]">Jurisdiction</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[140px]">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-[200px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[250px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[120px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[80px]" />
                </TableCell>
                <TableCell>
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
    <div className="rounded-md border">
      <Table>
        <TableCaption className="text-left p-4 text-muted-foreground">
          {cases.length === 0
            ? "No cases found. Create your first case to get started."
            : `Showing ${cases.length} case${cases.length !== 1 ? 's' : ''}`
          }
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[150px]">Jurisdiction</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[140px]">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div className="text-muted-foreground">No cases available</div>
                  <div className="text-sm text-muted-foreground">
                    Create your first case to get started
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            cases.map((caseItem) => (
              <TableRow key={caseItem.id} className="group hover:bg-muted/50 transition-colors cursor-pointer" asChild>
                <Link href={`/case/${caseItem.id}`}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="font-semibold">{caseItem.title}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {caseItem.id.slice(0, 8)}...
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px] truncate" title={caseItem.description || undefined}>
                      {caseItem.description || <span className="text-muted-foreground italic">No description</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {caseItem.jurisdiction || <span className="text-muted-foreground italic">N/A</span>}
                  </TableCell>
                  <TableCell>
                    <CaseStatus status={caseItem.status} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(caseItem.createdAt)}
                    </div>
                  </TableCell>
                </Link>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
