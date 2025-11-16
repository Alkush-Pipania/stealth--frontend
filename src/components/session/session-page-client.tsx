"use client";

import { useState } from "react";
import { AppSession, Document } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AudioRecorder } from "./audio-recorder";
import { TranscriptionDisplay } from "./transcription-display";
import { FileText, Calendar } from "lucide-react";

interface SessionPageClientProps {
  session: AppSession & {
    Document: Document[];
  };
}

export interface TranscriptionEntry {
  speaker: number;
  text: string;
  timestamp: number;
  confidence: number;
}

export default function SessionPageClient({ session }: SessionPageClientProps) {
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const handleTranscription = (entry: TranscriptionEntry) => {
    setTranscriptions((prev) => [...prev, entry]);
  };

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{session.name}</h1>
          {session.description && (
            <p className="text-muted-foreground mt-2">{session.description}</p>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Created {new Date(session.createdAt).toLocaleDateString()}</span>
          </div>
          <Badge variant={session.isActive ? "default" : "secondary"}>
            {session.isActive ? "Active" : "Inactive"}
          </Badge>
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>{session.Document.length} documents</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="recording" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recording">Recording</TabsTrigger>
          <TabsTrigger value="transcription">Transcription</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="recording" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audio Recording & Diarization</CardTitle>
              <CardDescription>
                Record your voice and meeting audio with real-time speaker diarization powered by Deepgram
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AudioRecorder
                sessionId={session.id}
                onTranscription={handleTranscription}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcription" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Transcription</CardTitle>
              <CardDescription>
                Real-time transcription with speaker diarization (Speaker 0, Speaker 1, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TranscriptionDisplay transcriptions={transcriptions} isRecording={isRecording} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Documents</CardTitle>
              <CardDescription>
                Documents associated with this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {session.Document.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No documents attached to this session
                </div>
              ) : (
                <div className="space-y-3">
                  {session.Document.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.fileName} • {(doc.fileSize / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Badge variant={doc.embed ? "default" : "secondary"}>
                        {doc.embed ? "Embedded" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
