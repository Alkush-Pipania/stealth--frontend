"use client";

import * as React from "react";
import { useSelector } from "react-redux";
import { DataTable } from "@/components/documents";
import { RootState } from "@/store";

export default function DocumentsPage() {
  const { documents, loading, error } = useSelector((state: RootState) => state.documents);
  const { AppSessions } = useSelector((state: RootState) => state.AppSessions);

  // Get the active session or the first session
  const activeSession = React.useMemo(() => {
    return AppSessions.find(session => session.isActive) || AppSessions[0];
  }, [AppSessions]);

  // API calls removed - add your own backend integration here

  const handleRefresh = React.useCallback(() => {
    // Add your own refresh logic here
  }, []);

  return (
    <div className="container mx-auto py-8 bg-background dark:bg-background">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-foreground">Documents</h1>
            <p className="text-muted-foreground dark:text-muted-foreground">
              Manage and organize your uploaded documents
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 dark:bg-destructive/20 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-destructive dark:text-destructive">
                  Error loading documents
                </h3>
                <div className="mt-2 text-sm text-destructive dark:text-destructive">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        <DataTable
          data={documents}
          isLoading={loading}
          onRefresh={handleRefresh}
          sessionId={activeSession?.id}
        />
      </div>
    </div>
  );
}
