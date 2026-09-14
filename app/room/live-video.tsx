"use client";

import "@livekit/components-styles";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  TrackToggle,
  VideoTrack,
  useParticipants,
  useTracks,
  useTranscriptions,
} from "@livekit/components-react";

import { Room, Track } from "livekit-client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export type TranscriptEntry = {
  id: string;
  speaker: string;
  text: string;
};

type LiveVideoRoomProps = {
  transcriptEnabled: boolean;
  onTranscriptChange: (entries: TranscriptEntry[]) => void;
  onConversationReadyChange: (ready: boolean) => void;
};

export default function LiveVideoRoom({
  transcriptEnabled,
  onTranscriptChange,
  onConversationReadyChange,
}: LiveVideoRoomProps) {
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  /*
   * Keep one LiveKit Room instance.
   */
  const room = useMemo(() => {
    return new Room({
      adaptiveStream: true,
      dynacast: true,
    });
  }, []);

  /*
   * Get LiveKit token once.
   */
  useEffect(() => {
    let cancelled = false;

    async function getToken() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/livekit/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              room: "randomlyy-lobby",
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to create LiveKit token.",
          );
        }

        if (cancelled) return;

        setToken(data.token);
        setServerUrl(data.serverUrl);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to connect to LiveKit.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    getToken();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Stable error handler.
   */
  const handleError = useCallback(
    (roomError: Error) => {
      console.error(
        "LiveKit connection error:",
        roomError,
      );

      setError(
        `Live video connection failed: ${roomError.message}`,
      );
    },
    [],
  );

  /*
   * Stable disconnect handler.
   */
  const handleDisconnected = useCallback(
    (reason: unknown) => {
      console.log(
        "LiveKit disconnected:",
        reason,
      );
    },
    [],
  );

  /*
   * Disconnect only when this component is removed.
   */
  useEffect(() => {
    return () => {
      room.disconnect();
    };
  }, [room]);

  /*
   * Loading screen.
   */
  if (loading || !token || !serverUrl) {
    return (
      <div className="flex min-h-[480px] items-center justify-center rounded-2xl bg-[#080d1d]">
        <div className="text-center">
          <div className="mb-4 text-5xl">
            🌍
          </div>

          <p className="text-sm text-slate-400">
            Connecting to live video...
          </p>

          <div className="mx-auto mt-4 h-1 w-32 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-purple-500" />
          </div>
        </div>
      </div>
    );
  }

  /*
   * Error screen.
   */
  if (error) {
    return (
      <div className="flex min-h-[480px] items-center justify-center rounded-2xl border border-red-500/20 bg-[#120b12] p-6 text-center">
        <div>
          <div className="text-4xl">
            ⚠️
          </div>

          <p className="mt-4 text-sm font-semibold text-red-300">
            Live video connection failed
          </p>

          <p className="mt-2 max-w-sm text-xs leading-5 text-red-200/70">
            {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="mt-5 rounded-xl bg-purple-600 px-5 py-3 text-xs font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
   * LiveKit room.
   */
  return (
    <LiveKitRoom
      room={room}
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={true}
      video={true}
      onError={handleError}
      onDisconnected={handleDisconnected}
      className="relative flex h-full min-h-[480px] flex-col overflow-hidden rounded-2xl"
    >
      <LiveTranscriptBridge
        transcriptEnabled={transcriptEnabled}
        onTranscriptChange={onTranscriptChange}
        onConversationReadyChange={
          onConversationReadyChange
        }
      />

      <LiveParticipantGrid />

      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}


/* =========================================================
   TRANSCRIPT
========================================================= */

function LiveTranscriptBridge({
  transcriptEnabled,
  onTranscriptChange,
  onConversationReadyChange,
}: LiveVideoRoomProps) {
  const participants = useParticipants();
  const transcriptions = useTranscriptions();

  const realParticipants = participants.filter(
    (participant) => !participant.isAgent,
  );

  const ready = realParticipants.length >= 2;

  useEffect(() => {
    onConversationReadyChange(ready);
  }, [
    ready,
    onConversationReadyChange,
  ]);

  useEffect(() => {
    /*
     * Transcript OFF = completely empty.
     */
    if (!transcriptEnabled) {
      onTranscriptChange([]);
      return;
    }

    /*
     * Only real LiveKit transcription.
     * No fake/sample messages.
     */
    const entries: TranscriptEntry[] =
      transcriptions
        .filter(
          (item) =>
            item.text &&
            item.text.trim().length > 0,
        )
        .map((item) => ({
          id: item.streamInfo.id,
          speaker:
            item.participantInfo?.identity ||
            "Stranger",
          text: item.text.trim(),
        }));

    onTranscriptChange(entries);
  }, [
    transcriptEnabled,
    transcriptions,
    onTranscriptChange,
  ]);

  return null;
}


/* =========================================================
   VIDEO GRID
========================================================= */

function LiveParticipantGrid() {
  const tracks = useTracks([
    {
      source: Track.Source.Camera,
      withPlaceholder: true,
    },
  ]);

  const localTrack = tracks.find(
    (item) => item.participant.isLocal,
  );

  const remoteTrack = tracks.find(
    (item) => !item.participant.isLocal,
  );

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 bg-[#050817] p-3 sm:grid-cols-2">

      {/* YOU */}
      <VideoBox
        track={localTrack}
        label="YOU"
        waitingText="Starting your camera..."
        local
      />

      {/* STRANGER */}
      <VideoBox
        track={remoteTrack}
        label="STRANGER"
        waitingText="Waiting for stranger..."
      />

      {/* CONTROLS */}
      <div className="col-span-1 flex justify-center gap-2 pb-1 sm:col-span-2">
        <CameraButton />
        <MicButton />
      </div>
    </div>
  );
}


/* =========================================================
   CAMERA BUTTON
========================================================= */

function CameraButton() {
  return (
    <TrackToggle
      /*
       * LiveKit versions have different ToggleSource
       * TypeScript definitions.
       *
       * The runtime value is the correct LiveKit camera
       * source. The cast only solves the TypeScript mismatch.
       */
      source={Track.Source.Camera as any}
      className="flex min-w-[90px] flex-col items-center justify-center rounded-xl border border-slate-700 bg-[#0c1429] px-4 py-3 text-xs font-medium text-slate-200 transition hover:border-purple-500 hover:bg-purple-500/10"
    >
      <span className="text-lg">
        📹
      </span>

      <span className="mt-1">
        Camera
      </span>
    </TrackToggle>
  );
}


/* =========================================================
   MIC BUTTON
========================================================= */

function MicButton() {
  return (
    <TrackToggle
      /*
       * Same compatibility fix for microphone.
       */
      source={Track.Source.Microphone as any}
      className="flex min-w-[90px] flex-col items-center justify-center rounded-xl border border-slate-700 bg-[#0c1429] px-4 py-3 text-xs font-medium text-slate-200 transition hover:border-purple-500 hover:bg-purple-500/10"
    >
      <span className="text-lg">
        🎙️
      </span>

      <span className="mt-1">
        Mic
      </span>
    </TrackToggle>
  );
}


/* =========================================================
   VIDEO BOX
========================================================= */

function VideoBox({
  track,
  label,
  waitingText,
  local = false,
}: {
  track: any;
  label: string;
  waitingText: string;
  local?: boolean;
}) {
  return (
    <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-[#090e20] to-[#10182d]">

      {track ? (
        <VideoTrack
          trackRef={track}
          autoPlay
          playsInline
          className="block h-full min-h-[260px] w-full object-cover"
        />
      ) : (
        <div className="flex h-full min-h-[260px] items-center justify-center">
          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-3xl">
              {local ? "🙂" : "👤"}
            </div>

            <p className="mt-4 text-sm text-slate-400">
              {waitingText}
            </p>

          </div>
        </div>
      )}

      {/* LABEL */}
      <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/70 px-4 py-1.5 text-xs font-bold text-white backdrop-blur">
        {label}
      </div>
    </div>
  );
}