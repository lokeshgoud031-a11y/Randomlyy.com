"use client";

import "@livekit/components-styles";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  RoomContext,
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
  onConversationReadyChange: (isReady: boolean) => void;
};

export default function LiveVideoRoom({
  transcriptEnabled,
  onTranscriptChange,
  onConversationReadyChange,
}: LiveVideoRoomProps) {
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(true);

  /*
   * IMPORTANT:
   * Keep the Room instance stable.
   * This prevents React from repeatedly creating/destroying
   * the LiveKit connection.
   */
  const room = useMemo(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      }),
    [],
  );

  /*
   * Get the LiveKit token only once.
   */
  useEffect(() => {
    let cancelled = false;

    async function getToken() {
      try {
        setConnecting(true);
        setError("");

        const response = await fetch("/api/livekit/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            room: "randomlyy-lobby",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Could not create LiveKit token.",
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
            : "Could not connect to LiveKit.",
        );
      } finally {
        if (!cancelled) {
          setConnecting(false);
        }
      }
    }

    getToken();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Stable error callback.
   */
  const handleRoomError = useCallback((roomError: Error) => {
    console.error("LiveKit room error:", roomError);

    setError(
      `Live video connection failed: ${roomError.message}`,
    );
  }, []);

  /*
   * Stable disconnect callback.
   */
  const handleDisconnected = useCallback((reason: unknown) => {
    console.log("LiveKit disconnected:", reason);
  }, []);

  /*
   * Clean up the Room when this component actually disappears.
   */
  useEffect(() => {
    return () => {
      room.disconnect();
    };
  }, [room]);

  if (error) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <div>
          <p className="text-sm font-semibold text-red-300">
            Live video connection failed
          </p>

          <p className="mt-2 text-xs text-red-200/80">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (connecting || !token || !serverUrl) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/60">
        <p className="text-sm text-slate-400">
          Connecting to live video...
        </p>
      </div>
    );
  }

  return (
    <RoomContext.Provider value={room}>
      <LiveKitRoom
        room={room}
        token={token}
        serverUrl={serverUrl}
        connect={true}
        audio={true}
        video={true}
        onError={handleRoomError}
        onDisconnected={handleDisconnected}
        className="relative flex h-full flex-col overflow-hidden rounded-2xl"
      >
        <LiveTranscriptBridge
          transcriptEnabled={transcriptEnabled}
          onTranscriptChange={onTranscriptChange}
          onConversationReadyChange={onConversationReadyChange}
        />

        <LiveParticipantGrid />

        <div className="flex shrink-0 justify-center gap-2 border-t border-slate-800 bg-slate-950/95 p-3">
          <TrackToggle
            source={Track.Source.Microphone}
            className="rounded-full border border-slate-700 bg-slate-800 px-5 py-2 text-xs font-medium text-white"
          >
            🎤 Mic
          </TrackToggle>

          <TrackToggle
            source={Track.Source.Camera}
            className="rounded-full border border-slate-700 bg-slate-800 px-5 py-2 text-xs font-medium text-white"
          >
            📹 Camera
          </TrackToggle>
        </div>

        <RoomAudioRenderer />
      </LiveKitRoom>
    </RoomContext.Provider>
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

  const hasTwoParticipants = realParticipants.length >= 2;

  useEffect(() => {
    onConversationReadyChange(hasTwoParticipants);
  }, [
    hasTwoParticipants,
    onConversationReadyChange,
  ]);

  useEffect(() => {
    /*
     * Transcript is completely empty when OFF.
     */
    if (!transcriptEnabled) {
      onTranscriptChange([]);
      return;
    }

    /*
     * Only show actual LiveKit transcription.
     * No fake/sample messages.
     */
    const entries: TranscriptEntry[] = transcriptions
      .filter(
        (transcription) =>
          transcription.text &&
          transcription.text.trim().length > 0,
      )
      .map((transcription) => ({
        id: transcription.streamInfo.id,
        speaker:
          transcription.participantInfo?.identity ||
          "Stranger",
        text: transcription.text.trim(),
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
    (track) => track.participant.isLocal,
  );

  const remoteTrack = tracks.find(
    (track) => !track.participant.isLocal,
  );

  return (
    <div
      data-lk-theme="default"
      className="grid min-h-0 flex-1 grid-cols-1 gap-3 bg-slate-950 p-3 sm:grid-cols-2"
    >
      {/* YOU */}
      <VideoBox
        track={localTrack}
        label="YOU"
        waitingText="Starting your camera..."
      />

      {/* STRANGER */}
      <VideoBox
        track={remoteTrack}
        label="STRANGER"
        waitingText="Waiting for stranger..."
      />
    </div>
  );
}


/* =========================================================
   VIDEO BOX
========================================================= */

function VideoBox({
  track,
  label,
  waitingText,
}: {
  track: any;
  label: string;
  waitingText: string;
}) {
  return (
    <div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-950 to-slate-900">
      {track ? (
        <VideoTrack
          trackRef={track}
          autoPlay
          playsInline
          className="block h-full min-h-[220px] w-full object-cover"
        />
      ) : (
        <div className="flex h-full min-h-[220px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-2xl">
              👤
            </div>

            <p className="text-sm text-slate-400">
              {waitingText}
            </p>
          </div>
        </div>
      )}

      <span className="absolute bottom-3 left-3 rounded-full border border-slate-600 bg-slate-950/85 px-3 py-1.5 text-xs font-medium text-white">
        {label}
      </span>
    </div>
  );
}