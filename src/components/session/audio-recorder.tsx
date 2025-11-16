"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Radio, Square } from "lucide-react";
import { TranscriptionEntry } from "./session-page-client";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  sessionId: string;
  onTranscription: (entry: TranscriptionEntry) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

export function AudioRecorder({
  sessionId,
  onTranscription,
  isRecording,
  setIsRecording,
}: AudioRecorderProps) {
  const [micPermission, setMicPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const { toast } = useToast();

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        }
      });

      streamRef.current = stream;
      setMicPermission(true);
      setError(null);

      // Set up audio level monitoring
      setupAudioLevelMonitoring(stream);

      toast({
        title: "Microphone Access Granted",
        description: "You can now start recording",
      });
    } catch (err) {
      setError("Failed to access microphone. Please grant permission and try again.");
      console.error("Microphone permission error:", err);
      toast({
        title: "Microphone Access Denied",
        description: "Please grant microphone permission to record audio",
        variant: "destructive",
      });
    }
  };

  // Set up audio level visualization
  const setupAudioLevelMonitoring = (stream: MediaStream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    microphone.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    updateAudioLevel();
  };

  // Update audio level for visualization
  const updateAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255);

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  // Start recording with Deepgram WebSocket
  const startRecording = async () => {
    if (!streamRef.current) {
      await requestMicrophonePermission();
      return;
    }

    try {
      // Get temporary Deepgram key from our API
      const response = await fetch("/api/deepgram/stream");
      const data = await response.json();

      if (!data.key) {
        throw new Error("Failed to get Deepgram API key");
      }

      // Connect to Deepgram WebSocket directly
      const wsUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=en&smart_format=true&diarize=true&punctuate=true&interim_results=false&utterance_end_ms=1000`;

      const ws = new WebSocket(wsUrl, ["token", data.key]);
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log("Deepgram WebSocket connected");
        setIsRecording(true);
        setError(null);

        toast({
          title: "Recording Started",
          description: "Real-time transcription with speaker diarization is active",
        });
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // Handle Deepgram response
        if (data.type === "Results") {
          const channel = data.channel;
          const alternative = channel?.alternatives?.[0];

          if (alternative && alternative.transcript) {
            // Get speaker from words if available
            const words = alternative.words || [];
            const speaker = words.length > 0 ? (words[0].speaker ?? 0) : 0;

            const entry: TranscriptionEntry = {
              speaker,
              text: alternative.transcript,
              timestamp: Date.now(),
              confidence: alternative.confidence || 0,
            };

            onTranscription(entry);
          }
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Connection error. Please try again.");
        toast({
          title: "Connection Error",
          description: "Failed to connect to transcription service",
          variant: "destructive",
        });
      };

      ws.onclose = () => {
        console.log("Deepgram WebSocket closed");
        setIsRecording(false);
      };

      // Set up MediaRecorder to send audio data
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
        }
      };

      mediaRecorder.start(250); // Send data every 250ms
    } catch (err) {
      setError("Failed to start recording. Please try again.");
      console.error("Recording error:", err);
      toast({
        title: "Recording Failed",
        description: "Could not start recording. Please check your microphone.",
        variant: "destructive",
      });
    }
  };

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    setIsRecording(false);

    toast({
      title: "Recording Stopped",
      description: "Transcription has been saved",
    });
  }, [setIsRecording, toast]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Microphone Permission */}
      {!micPermission ? (
        <Alert>
          <Mic className="h-4 w-4" />
          <AlertDescription>
            Microphone access is required for recording. Click the button below to grant permission.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Audio Level Visualization */}
      {micPermission && (
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Audio Level</p>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-100"
                style={{ width: `${audioLevel * 100}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Recording Controls */}
      <div className="flex flex-col items-center gap-4">
        {!micPermission ? (
          <Button
            size="lg"
            onClick={requestMicrophonePermission}
            className="w-full max-w-xs"
          >
            <Mic className="mr-2 h-5 w-5" />
            Grant Microphone Access
          </Button>
        ) : (
          <div className="flex gap-4">
            {!isRecording ? (
              <Button
                size="lg"
                onClick={startRecording}
                className="min-w-[200px]"
              >
                <Radio className="mr-2 h-5 w-5" />
                Start Recording
              </Button>
            ) : (
              <Button
                size="lg"
                variant="destructive"
                onClick={stopRecording}
                className="min-w-[200px]"
              >
                <Square className="mr-2 h-5 w-5" />
                Stop Recording
              </Button>
            )}

            {!isRecording && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                  }
                  setMicPermission(false);
                }}
              >
                <MicOff className="mr-2 h-5 w-5" />
                Revoke Access
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          <span>Recording in progress with real-time diarization...</span>
        </div>
      )}
    </div>
  );
}
