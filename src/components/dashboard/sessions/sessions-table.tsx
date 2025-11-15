"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchAppSessions } from "@/store/thunk/sessionthunk";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatDate, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Share, Trash2, Eye } from "lucide-react";
import { useResponsive } from "@/hooks/use-responsive";
import { MobileSessionCard } from "./mobile-session-card";

// Inline SessionStatus component
function SessionStatus({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant={isActive ? "default" : "secondary"}
      className={cn(
        "text-xs font-medium transition-colors",
        isActive
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/50"
          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
      )}
    >
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5",
          isActive
            ? "bg-green-500 dark:bg-green-400"
            : "bg-gray-400 dark:bg-gray-500"
        )}
      />
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

// Inline SessionActions component
function SessionActions({ session }: { session: any }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/dashboard/sessions/${session.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `Session: ${session.name}`,
          text: session.description,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        console.log('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing session:', error);
    }
  };

  const handleView = () => {
    window.location.href = `/dashboard/sessions/${session.id}`;
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${session.name}"?`)) return;
    
    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Session "${session.name}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting session:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-muted transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleView} className="cursor-pointer">
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
          <Share className="mr-2 h-4 w-4" />
          Share
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleDelete}
          className="cursor-pointer text-destructive focus:text-destructive"
          disabled={isDeleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SessionsTable() {
  const dispatch = useDispatch<AppDispatch>();
  const { AppSessions, loading, error } = useSelector((state: RootState) => state.AppSessions);
  const { isMobile } = useResponsive();

  // Ensure AppSessions is always an array
  const sessions = Array.isArray(AppSessions) ? AppSessions : [];

  useEffect(() => {
    dispatch(fetchAppSessions());
  }, [dispatch]);

  if (loading) {
    if (isMobile) {
      return (
        <div className="space-y-4 p-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-[180px]" />
                  <Skeleton className="h-3 w-[120px]" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[60px]" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[140px]">Created</TableHead>
              <TableHead className="w-[120px]">Documents</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[200px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[60px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-md" />
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
        <p className="text-sm text-destructive">Error loading sessions: {error}</p>
      </div>
    );
  }

  // Mobile view rendering
  if (isMobile) {
    return (
      <div className="space-y-4 p-4">
        {/* Mobile Header */}
        <div className="text-sm text-muted-foreground px-1">
          {sessions.length === 0
            ? "No sessions found. Create your first session to get started."
            : `Showing ${sessions.length} session${sessions.length !== 1 ? 's' : ''}`
          }
        </div>

        {/* Mobile Cards */}
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="text-muted-foreground mb-2">No sessions available</div>
            <div className="text-sm text-muted-foreground">
              Create your first session to get started
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session: any) => (
              <MobileSessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop view rendering (existing table)
  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption className="text-left p-4 text-muted-foreground">
          {sessions.length === 0
            ? "No sessions found. Create your first session to get started."
            : `Showing ${sessions.length} session${sessions.length !== 1 ? 's' : ''}`
          }
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[140px]">Created</TableHead>
            <TableHead className="w-[120px]">Documents</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="text-muted-foreground">No sessions available</div>
                  <div className="text-sm text-muted-foreground">
                    Create your first session to get started
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            sessions.map((session: any) => (
              <TableRow key={session.id} className="group hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="font-semibold">{session.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {session.id.slice(0, 8)}...
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[300px] truncate" title={session.description}>
                    {session.description || "No description"}
                  </div>
                </TableCell>
                <TableCell>
                  <SessionStatus isActive={session.isActive} />
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(session.createdAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium">{session.Document?.length || 0}</span>
                    <span className="text-xs text-muted-foreground">files</span>
                  </div>
                </TableCell>
                <TableCell>
                  <SessionActions session={session} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
