"use client";

/**
 * @file use-voice-recorder.ts
 * @description React hook that wraps the Web Speech API for in-browser voice
 * input with optional multilingual translation via the backend `/api/translate`
 * route.
 *
 * @packageDocumentation
 * @category Hooks
 */

import * as React from "react";
import type { VoiceState, VoiceRecording } from "@/models/user";

export type { VoiceState, VoiceRecording };

/**
 * Return value of the {@link useVoiceRecorder} hook.
 *
 * @category Hooks
 */
export interface UseVoiceRecorderReturn {
  /** Current state of the recorder (`idle` | `recording` | `translating` | `done`). */
  voiceState: VoiceState;
  /** The running transcript shown while recording is in progress. */
  liveTranscript: string;
  /** Number of seconds elapsed since recording started. */
  recordingSeconds: number;
  /** Finalised recording metadata, or `null` before the first recording. */
  voiceRecording: VoiceRecording | null;
  /**
   * Format a seconds count as `MM:SS`.
   * @param s - Total seconds to format.
   */
  formatSeconds: (s: number) => string;
  /** Start the Web Speech API recognition session. */
  startRecording: () => Promise<void>;
  /** Stop the recognition session and clear transient state. */
  stopRecording: () => void;
  /** Stop recording and clear the saved {@link voiceRecording}. */
  reset: () => void;
}

/**
 * Encapsulates all Web Speech API logic for voice input.
 *
 * - Uses `window.SpeechRecognition` / `webkitSpeechRecognition`
 * - Translates non-English transcripts via `GET /api/translate`
 * - Cleans up recognition and the timer interval on unmount
 *
 * @param lang - BCP-47 language code passed to the recogniser (e.g. `"en-IN"`, `"hi-IN"`).
 * @returns Recorder state and control handlers.
 *
 * @example
 * ```tsx
 * const { voiceState, startRecording, stopRecording } = useVoiceRecorder("en-IN");
 * ```
 *
 * @category Hooks
 */
export const useVoiceRecorder = (lang: string): UseVoiceRecorderReturn => {
  const [voiceState, setVoiceState]             = React.useState<VoiceState>("idle");
  const [liveTranscript, setLiveTranscript]     = React.useState("");
  const [recordingSeconds, setRecordingSeconds] = React.useState(0);
  const [voiceRecording, setVoiceRecording]     = React.useState<VoiceRecording | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef     = React.useRef<any>(null);
  const finalTranscriptRef = React.useRef("");
  const timerRef           = React.useRef<ReturnType<typeof setInterval> | null>(null);

  /* Cleanup on unmount */
  React.useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      stopTimer();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatSeconds = (s: number): string => {
    return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    stopTimer();
    setVoiceState("idle");
    setLiveTranscript("");
    setRecordingSeconds(0);
    finalTranscriptRef.current = "";
  };

  const reset = () => {
    stopRecording();
    setVoiceRecording(null);
  };

  const startRecording = async () => {
    const SpeechRecognition =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    finalTranscriptRef.current = "";
    setLiveTranscript("");
    setVoiceState("recording");
    setRecordingSeconds(0);
    setVoiceRecording(null);

    timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = lang;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscriptRef.current += t + " ";
        } else {
          interim = t;
        }
      }
      setLiveTranscript(finalTranscriptRef.current + interim);
    };

    recognition.onend = async () => {
      stopTimer();
      const raw = finalTranscriptRef.current.trim();
      if (!raw) { setVoiceState("idle"); return; }

      if (!lang.startsWith("en")) {
        setVoiceState("translating");
        try {
          const res  = await fetch(`/api/translate?text=${encodeURIComponent(raw)}&from=${lang}`);
          const data = await res.json() as { translated: string; original: string };
          setVoiceRecording({ lang, original: raw });
          setLiveTranscript(data.translated);
        } catch {
          setVoiceRecording({ lang, original: raw });
          setLiveTranscript(raw);
        }
      } else {
        setVoiceRecording({ lang, original: raw });
        setLiveTranscript(raw);
      }
      setVoiceState("done");
    };

    recognition.onerror = () => {
      stopTimer();
      setVoiceState("idle");
    };

    recognition.start();
  };

  return {
    voiceState,
    liveTranscript,
    recordingSeconds,
    voiceRecording,
    formatSeconds,
    startRecording,
    stopRecording,
    reset,
  };
};
