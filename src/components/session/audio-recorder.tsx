"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Radio, Square, AlertCircle, CheckCircle } from "lucide-react";
import { TranscriptionEntry } from "./session-page-client";
import { toast } from "sonner";

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
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<string>("disconnected");
  const [deepgramApiKey, setDeepgramApiKey] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const deepgramSocketRef = useRef<WebSocket | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Fetch Deepgram API Key
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch("/api/deepgram/token");
        const data = await response.json();
        if (data.key) {
          setDeepgramApiKey(data.key);
          console.log("✅ Deepgram API key loaded");
        } else {
          console.error("❌ Failed to load Deepgram API key");
          toast.error("Deepgram Configuration Error", {
            description: "Could not load API key",
          });
        }
      } catch (error) {
        console.error("❌ Error fetching Deepgram API key:", error);
      }
    };

    fetchApiKey();
  }, []);

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

      // Set up audio level monitoring
      setupAudioLevelMonitoring(stream);

      toast.success("Microphone Access Granted", {
        description: "Microphone is ready for recording",
      });

      console.log("🎤 Microphone access granted");
    } catch (err) {
      console.error("❌ Microphone access denied:", err);
      toast.error("Microphone Access Denied", {
        description: "Please grant microphone permission to use this feature",
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

  // Convert Float32Array to Int16Array (PCM)
  const convertFloat32ToInt16 = (buffer: Float32Array): Int16Array => {
    const int16 = new Int16Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16;
  };

  // Connect to Deepgram WebSocket
  const connectToDeepgram = useCallback(() => {
    if (!deepgramApiKey) {
      console.error("❌ No Deepgram API key available");
      toast.error("Configuration Error", {
        description: "Deepgram API key not available",
      });
      return null;
    }

    console.log("🔑 API Key loaded:", deepgramApiKey.substring(0, 10) + "...");

    // Build URL with parameters
    const params = new URLSearchParams({
      model: "nova-2",
      encoding: "linear16",
      sample_rate: "16000",
      channels: "1",
      diarize: "true",
      punctuate: "true",
      interim_results: "false",
      utterance_end_ms: "1000",
      vad_events: "true",
    });

    const url = `wss://api.deepgram.com/v1/listen?${params.toString()}`;

    console.log("🌐 Connecting to Deepgram WebSocket...");
    console.log("📍 URL:", url);

    // Deepgram uses Authorization header-style authentication via subprotocol
    // Format: ["token", "YOUR_API_KEY"]
    const socket = new WebSocket(url, ["token", deepgramApiKey]);

    socket.onopen = () => {
      console.log("🔌 Connected to Deepgram");
      setConnectionStatus("connected");
      toast.success("Connected to Deepgram", {
        description: "Real-time transcription active with speaker diarization",
      });
    };

    socket.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);
        
        // Log all received data for debugging
        console.log("📩 Deepgram response:", data);

        // Handle transcription results
        if (data.type === "Results" && data.channel?.alternatives?.[0]) {
          const transcript = data.channel.alternatives[0].transcript;
          
          // Only process if there's actual text
          if (transcript && transcript.trim().length > 0) {
            const words = data.channel.alternatives[0].words || [];
            const confidence = data.channel.alternatives[0].confidence || 0;
            const isFinal = data.is_final;

            console.log("📝 Transcription:", {
              transcript,
              isFinal,
              confidence,
              speaker: words[0]?.speaker ?? 0,
            });

            // Only add final transcriptions to avoid duplicates
            if (isFinal) {
              const entry: TranscriptionEntry = {
                speaker: words[0]?.speaker ?? 0,
                text: transcript,
                timestamp: Date.now(),
                confidence: confidence,
              };

              console.log("✅ Adding transcription entry:", entry);
              onTranscription(entry);
            }
          }
        }

        // Handle metadata events
        if (data.type === "Metadata") {
          console.log("📊 Deepgram Metadata:", data);
        }

        // Handle utterance end events
        if (data.type === "UtteranceEnd") {
          console.log("🔚 Utterance ended");
        }

        // Handle speech started events
        if (data.type === "SpeechStarted") {
          console.log("🗣️ Speech started");
        }

      } catch (error) {
        console.error("❌ Error parsing Deepgram message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("❌ Deepgram WebSocket error:", error);
      console.error("❌ This usually means:");
      console.error("   1. Invalid API key");
      console.error("   2. API key not set in .env.local");
      console.error("   3. Need to restart dev server after adding API key");
      setConnectionStatus("error");
      toast.error("Connection Error", {
        description: "Check console for details. Verify DEEPGRAM_API_KEY in .env.local",
      });
    };

    socket.onclose = (event) => {
      console.log("🔌 Disconnected from Deepgram");
      console.log("Close code:", event.code, "Reason:", event.reason || "No reason provided");
      setConnectionStatus("disconnected");
      
      if (event.code !== 1000) {
        console.error("❌ Abnormal closure. Code:", event.code);
        console.error("Common causes:");
        console.error("  - Code 1006: Authentication failed (invalid API key)");
        console.error("  - Code 1002: Protocol error");
        console.error("  - Code 1008: Policy violation (rate limit, quota)");
        
        let errorMsg = "Connection failed. ";
        if (event.code === 1006) {
          errorMsg += "Please verify your Deepgram API key is valid and active.";
        } else {
          errorMsg += `Error code: ${event.code}`;
        }
        
        toast.error("Connection Error", {
          description: errorMsg,
        });
      }
    };

    return socket;
  }, [deepgramApiKey, onTranscription]);

  // Start recording with Deepgram
  const startRecording = async () => {
    if (!streamRef.current) {
      await requestMicrophonePermission();
      return;
    }

    if (!deepgramApiKey) {
      toast.error("Configuration Error", {
        description: "Deepgram API key not configured. Please set DEEPGRAM_API_KEY in your environment.",
      });
      return;
    }

    try {
      console.log("🎙️ Starting recording...");
      
      // Connect to Deepgram
      const socket = connectToDeepgram();
      if (!socket) return;

      deepgramSocketRef.current = socket;

      // Wait for socket to open
      socket.addEventListener("open", () => {
        console.log("🚀 WebSocket opened, starting audio stream...");
        
        // Create audio context for processing
        const audioContext = new AudioContext({ sampleRate: 16000 });
        const source = audioContext.createMediaStreamSource(streamRef.current!);
        
        // Use ScriptProcessorNode for audio processing
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        
        sourceRef.current = source;
        processorRef.current = processor;

        let audioChunksCount = 0;

        processor.onaudioprocess = (e) => {
          if (socket.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmData = convertFloat32ToInt16(inputData);
            
            socket.send(pcmData.buffer);
            audioChunksCount++;
            
            if (audioChunksCount % 10 === 0) {
              console.log(`📤 Sent ${audioChunksCount} audio chunks to Deepgram`);
            }
          }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
        
        setIsRecording(true);
        
        console.log("✅ Recording started successfully with proper PCM encoding");
        toast.success("Recording Started", {
          description: "Speak now - diarization active",
        });
      });

    } catch (error) {
      console.error("❌ Error starting recording:", error);
      toast.error("Recording Error", {
        description: "Failed to start recording",
      });
    }
  };

  // Stop recording
  const stopRecording = useCallback(() => {
    console.log("⏹️ Stopping recording...");

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (deepgramSocketRef.current) {
      deepgramSocketRef.current.close();
      deepgramSocketRef.current = null;
    }

    setIsRecording(false);
    setConnectionStatus("disconnected");

    console.log("✅ Recording stopped");
    toast.info("Recording Stopped", {
      description: "Transcription saved",
    });
  }, [setIsRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (processorRef.current) {
        processorRef.current.disconnect();
      }

      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }

      if (deepgramSocketRef.current) {
        deepgramSocketRef.current.close();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {deepgramApiKey ? (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Deepgram real-time transcription with speaker diarization is ready. 
            Start recording to see live transcriptions with speaker identification.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please configure DEEPGRAM_API_KEY in your environment variables to enable transcription.
          </AlertDescription>
        </Alert>
      )}

      {/* Microphone Permission */}
      {!micPermission ? (
        <Alert>
          <Mic className="h-4 w-4" />
          <AlertDescription>
            Microphone access is required. Click the button below to grant permission.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Connection Status */}
      {micPermission && isRecording && (
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500 animate-pulse"
                  : connectionStatus === "error"
                  ? "bg-red-500"
                  : "bg-yellow-500"
              }`}
            />
            <p className="text-sm font-medium">
              {connectionStatus === "connected"
                ? "Live Transcription Active"
                : connectionStatus === "error"
                ? "Connection Error"
                : "Connecting..."}
            </p>
          </div>
        </Card>
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
                disabled={!deepgramApiKey}
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
    </div>
  );
}
