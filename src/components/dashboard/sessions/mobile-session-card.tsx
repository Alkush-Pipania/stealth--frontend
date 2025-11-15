"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, cn } from "@/lib/utils";
import { MoreHorizontal, Share, Trash2, Eye, Calendar, FileText, Activity } from "lucide-react";

interface AppSession {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  Document: any[];
}

interface MobileSessionCardProps {
  session: AppSession;
}

export function MobileSessionCard({ session }: MobileSessionCardProps) {
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
    <Card className="w-full transition-all duration-200 hover:shadow-md border-l-4 border-l-transparent hover:border-l-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-6 truncate">
              {session.name}
            </h3>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              ID: {session.id.slice(0, 12)}...
            </p>
          </div>
          
          <div className="flex items-center space-x-2 ml-3">
            <Badge
              variant={session.isActive ? "default" : "secondary"}
              className={cn(
                "text-xs font-medium transition-colors",
                session.isActive
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/50"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
              )}
            >
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full mr-1.5",
                  session.isActive
                    ? "bg-green-500 dark:bg-green-400"
                    : "bg-gray-400 dark:bg-gray-500"
                )}
              />
              {session.isActive ? "Active" : "Inactive"}
            </Badge>
            
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
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Description */}
        {session.description && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {session.description}
            </p>
          </div>
        )}
        
        {/* Session Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(session.createdAt)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Documents</p>
              <p className="font-medium">{session.Document?.length || 0} files</p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleView}
            className="flex-1"
          >
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex-1"
          >
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
