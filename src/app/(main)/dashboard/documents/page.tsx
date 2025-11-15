"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataTable } from "@/components/documents";
import { fetchDocuments } from "@/store/thunk/documentsthunk";
import { fetchAppSessions, createAppSession } from "@/store/thunk/sessionthunk";
import { AppDispatch, RootState } from "@/store";

export default function DocumentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { documents, loading, error } = useSelector((state: RootState) => state.documents);
  const { AppSessions, loading: sessionsLoading } = useSelector((state: RootState) => state.AppSessions);
  const [isCreatingDefaultSession, setIsCreatingDefaultSession] = React.useState(false);

  // Get the active session or the first session
  const activeSession = React.useMemo(() => {
    return AppSessions.find(session => session.isActive) || AppSessions[0];
  }, [AppSessions]);

  // Create default session if none exists
  React.useEffect(() => {
    const createDefaultSession = async () => {
      if (!sessionsLoading && AppSessions.length === 0 && !isCreatingDefaultSession) {
        setIsCreatingDefaultSession(true);
        try {
          await dispatch(createAppSession({
            name: "My Documents",
            description: "Default session for document uploads"
          })).unwrap();
        } catch (error) {
          console.error("Failed to create default session:", error);
        } finally {
          setIsCreatingDefaultSession(false);
        }
      }
    };

    createDefaultSession();
  }, [dispatch, AppSessions.length, sessionsLoading, isCreatingDefaultSession]);

  React.useEffect(() => {
    dispatch(fetchAppSessions());
    dispatch(fetchDocuments());
  }, [dispatch]);

  const handleRefresh = React.useCallback(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">
              Manage and organize your uploaded documents
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-destructive">
                  Error loading documents
                </h3>
                <div className="mt-2 text-sm text-destructive">
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
