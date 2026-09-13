"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LiveVideoRoom from "./live-video";

const transcriptLanguages = [
  "English",
  "Telugu",
  "Hindi",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Spanish",
  "French",
  "German",
  "Arabic",
  "Japanese",
  "Korean",
  "Portuguese",
  "Chinese",
  "Italian",
];

const messages = [
  { id: 1, user: "You", from: "Telugu", to: "English", text: "Namaskaram! Nenu oka naatu dostuni kalustunnaanu.", translated: "Hi! I’m excited to meet someone new today.", type: "outgoing" },
  { id: 2, user: "Aisha", from: "English", to: "Telugu", text: "Same here! I’d love to practice speaking English.", translated: "Nenu kuda anthe! Nenu English matladatam practice cheyyalani istunnanu.", type: "incoming" },
  { id: 3, user: "You", from: "Telugu", to: "English", text: "Chala bagundi. Mimmalni parichayam chesukundam.", translated: "Perfect — let’s start with a quick intro.", type: "outgoing" },
  { id: 4, user: "Aisha", from: "English", to: "Telugu", text: "I love travel, music, and learning new cultures.", translated: "Nenu travel, music, mariyu natanti cultures ni learn cheyyadaniki istunnanu.", type: "incoming" },
];

const participants = [
  { name: "Aisha", country: "UAE", accent: "English", color: "from-cyan-400 to-indigo-500" },
  { name: "You", country: "India", accent: "Telugu", color: "from-violet-500 to-pink-500" },
];

const cameraFilters = {
  normal: "none",
  bright: "brightness(1.2) contrast(1.08)",
  warm: "sepia(0.22) saturate(1.35)",
  cool: "hue-rotate(14deg) saturate(1.15)",
  grayscale: "grayscale(1)",
  contrast: "contrast(1.35) saturate(1.15)",
  dream: "brightness(1.12) saturate(1.45) blur(0.2px)",
  sunset: "sepia(0.3) saturate(1.6) hue-rotate(-12deg) contrast(1.08)",
  neon: "saturate(2) contrast(1.25) hue-rotate(24deg)",
  noir: "grayscale(1) contrast(1.55) brightness(0.92)",
};

export default function RoomPage() {
  const [showTranscript, setShowTranscript] = useState(true);
  const [transcriptLanguage, setTranscriptLanguage] = useState("English");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [realTimeConversation, setRealTimeConversation] = useState(true);
  const [cameraFilter, setCameraFilter] = useState<keyof typeof cameraFilters>("normal");
  const [mediaError, setMediaError] = useState("");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (cameraEnabled && localVideoRef.current && mediaStreamRef.current) {
      localVideoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [cameraEnabled]);

  const updateLocalStream = (stream: MediaStream) => {
    mediaStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  };

  const toggleCamera = async () => {
    setMediaError("");
    const stream = mediaStreamRef.current;
    const videoTrack = stream?.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.enabled = !cameraEnabled;
      setCameraEnabled(!cameraEnabled);
      return;
    }

    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      const nextStream = stream ?? new MediaStream();
      cameraStream.getVideoTracks().forEach((track) => nextStream.addTrack(track));
      updateLocalStream(nextStream);
      setCameraEnabled(true);
    } catch {
      setMediaError("Camera access was blocked. Please allow camera permission in your browser.");
    }
  };

  const toggleMicrophone = async () => {
    setMediaError("");

    if (!realTimeConversation) {
      setMediaError("Turn on Real-time conversation before enabling the microphone.");
      return;
    }

    const stream = mediaStreamRef.current;
    const audioTrack = stream?.getAudioTracks()[0];

    if (audioTrack && audioTrack.readyState === "live") {
      if (micEnabled) {
        audioTrack.stop();
        stream?.removeTrack(audioTrack);
        setMicEnabled(false);
      } else {
        audioTrack.enabled = true;
        setMicEnabled(true);
      }
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError("Microphone access is not supported by this browser.");
      return;
    }

    try {
      const microphoneStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const nextStream = stream ?? new MediaStream();
      microphoneStream.getAudioTracks().forEach((track) => nextStream.addTrack(track));
      updateLocalStream(nextStream);
      setMicEnabled(true);
    } catch (error) {
      const reason = error instanceof DOMException && error.name === "NotAllowedError"
        ? "Please allow microphone permission in your browser."
        : "Check that a microphone is connected and not being used by another app.";
      setMediaError(`Microphone access failed. ${reason}`);
    }
  };

  const toggleRealTimeConversation = () => {
    const nextEnabled = !realTimeConversation;
    const audioTrack = mediaStreamRef.current?.getAudioTracks()[0];

    if (audioTrack) {
      audioTrack.enabled = nextEnabled && micEnabled;
    }

    setRealTimeConversation(nextEnabled);
  };

  return (
    <main className="min-h-screen bg-[#050b14] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm text-slate-200">
              ← Back
            </Link>
            <div className="flex items-center gap-3">
              <img src="/icon.png" alt="Global logo" className="h-11 w-11 object-contain" />
              <div>
                <p className="text-lg font-bold tracking-tight">Randomlyy.com</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Global voice</p>
              </div>
            </div>
          </div>

          <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
            Live
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-indigo-950/30 md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Video call</p>
                <h2 className="mt-2 text-xl font-semibold">Live conversation</h2>
              </div>
              <button
                type="button"
                onClick={toggleRealTimeConversation}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  realTimeConversation
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                    : "border-slate-700 bg-slate-800 text-slate-300"
                }`}
              >
                Real-time {realTimeConversation ? "ON" : "OFF"}
              </button>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
              <div className="h-[22rem] w-full overflow-hidden rounded-[24px] border border-slate-700 bg-slate-950">
                <LiveVideoRoom />
              </div>

              <button className="flex h-14 w-full items-center justify-center rounded-full border border-indigo-500/40 bg-indigo-500/10 px-5 py-3 text-sm font-medium text-indigo-200 md:w-24 md:self-center">
                Next
              </button>
            </div>

            {mediaError && <p className="mt-4 text-center text-xs text-rose-300">{mediaError}</p>}
            {!realTimeConversation && <p className="mt-4 text-center text-xs text-amber-200">Real-time conversation is off.</p>}

            <label className="mx-auto mt-4 flex max-w-xs items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-400">
              Camera filter
              <select
                value={cameraFilter}
                onChange={(e) => setCameraFilter(e.target.value as keyof typeof cameraFilters)}
                className="rounded-xl border border-slate-700 bg-[#071321] px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              >
                <option value="normal">Normal</option>
                <option value="bright">Bright</option>
                <option value="warm">Warm</option>
                <option value="cool">Cool</option>
                <option value="grayscale">Grayscale</option>
                <option value="contrast">High contrast</option>
                <option value="dream">Dream glow</option>
                <option value="sunset">Sunset</option>
                <option value="neon">Neon</option>
                <option value="noir">Noir</option>
              </select>
            </label>

          </section>

          <aside className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-cyan-950/20 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Live chat</p>
                <h3 className="mt-2 text-xl font-semibold">Transcript</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTranscript(!showTranscript)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  showTranscript
                    ? "border border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
                    : "border border-slate-700 bg-slate-800 text-slate-300"
                }`}
              >
                {showTranscript ? "ON" : "OFF"}
              </button>
            </div>

            <label className="mb-3 block text-xs uppercase tracking-[0.18em] text-slate-400">
              Transcript language
            </label>
            <select
              value={transcriptLanguage}
              onChange={(e) => setTranscriptLanguage(e.target.value)}
              className="mb-4 w-full rounded-2xl border border-slate-700 bg-[#071321] px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
            >
              {transcriptLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>

            {showTranscript ? (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-2xl border p-3 text-sm ${
                      message.type === "outgoing"
                        ? "ml-auto border-indigo-500/40 bg-indigo-500/10"
                        : "border-slate-700 bg-slate-950/80"
                    }`}
                  >
                    <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-slate-400">
                      {message.user} · {message.from} → {message.to}
                    </p>
                    <p className="text-slate-200">{message.text}</p>
                    <p className="mt-2 text-xs text-cyan-300">
                      {transcriptLanguage === message.to ? message.translated : message.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-4 text-sm text-slate-400">
                Transcript is off. Turn it on to show language translation here.
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <input
                placeholder="Type a message..."
                className="w-full rounded-2xl border border-slate-700 bg-[#071321] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
              />
              <button className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white">
                Send
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
