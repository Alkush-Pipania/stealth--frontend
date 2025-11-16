"use client";

import { useEffect, useRef } from "react";
import { TranscriptionEntry } from "./session-page-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TranscriptionDisplayProps {
  transcriptions: TranscriptionEntry[];
  isRecording: boolean;
}

const SPEAKER_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-yellow-500",
  "bg-teal-500",
  "bg-indigo-500",
];

export function TranscriptionDisplay({ transcriptions, isRecording }: TranscriptionDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new transcriptions arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  // Copy all transcriptions to clipboard
  const copyToClipboard = () => {
    const text = transcriptions
      .map((entry) => {
        const time = new Date(entry.timestamp).toLocaleTimeString();
        return `[${time}] Speaker ${entry.speaker}: ${entry.text}`;
      })
      .join("\n\n");

    navigator.clipboard.writeText(text);
    toast.success("Copied to Clipboard", {
      description: "Transcription has been copied to your clipboard",
    });
  };

  // Download transcriptions as text file
  const downloadTranscription = () => {
    const text = transcriptions
      .map((entry) => {
        const time = new Date(entry.timestamp).toLocaleTimeString();
        return `[${time}] Speaker ${entry.speaker}: ${entry.text}`;
      })
      .join("\n\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcription-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Download Started", {
      description: "Your transcription is being downloaded",
    });
  };

  const getSpeakerColor = (speaker: number) => {
    return SPEAKER_COLORS[speaker % SPEAKER_COLORS.length];
  };

  if (transcriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Transcriptions Yet</h3>
        <p className="text-muted-foreground">
          {isRecording
            ? "Waiting for speech to transcribe..."
            : "Start recording to see real-time transcriptions with speaker diarization"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={copyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Copy All
        </Button>
        <Button variant="outline" size="sm" onClick={downloadTranscription}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      {/* Transcription List */}
      <ScrollArea className="h-[500px] rounded-md border p-4" ref={scrollRef}>
        <div className="space-y-4">
          {transcriptions.map((entry, index) => (
            <Card key={index} className="p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-start gap-3">
                {/* Speaker Avatar */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full ${getSpeakerColor(
                    entry.speaker
                  )} flex items-center justify-center text-white font-semibold`}
                >
                  {entry.speaker}
                </div>

                {/* Transcription Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Speaker {entry.speaker}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    {entry.confidence > 0 && (
                      <Badge
                        variant={entry.confidence > 0.8 ? "default" : "outline"}
                        className="text-xs"
                      >
                        {(entry.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{entry.text}</p>
                </div>
              </div>
            </Card>
          ))}

          {/* Live Indicator */}
          {isRecording && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              <span>Live transcription active</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Segments</p>
          <p className="text-2xl font-bold">{transcriptions.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Speakers Detected</p>
          <p className="text-2xl font-bold">
            {new Set(transcriptions.map((t) => t.speaker)).size}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Avg. Confidence</p>
          <p className="text-2xl font-bold">
            {transcriptions.length > 0
              ? (
                  (transcriptions.reduce((sum, t) => sum + t.confidence, 0) /
                    transcriptions.length) *
                  100
                ).toFixed(0)
              : 0}
            %
          </p>
        </Card>
      </div>
    </div>
  );
}
