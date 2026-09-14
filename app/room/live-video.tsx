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
   * Create one LiveKit Room instance.
   */
  const room = useMemo(() => {
    return new Room({
      adaptiveStream: true,
      dynacast: true,
    });
  }, []);

  /*
   * Get LiveKit token from our API.
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

        if (cancelled) {
          return;
        }

        setToken(data.token);
        setServerUrl(data.serverUrl);
      } catch (err) {
        if (cancelled) {
          return;
        }

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
   * LiveKit error.
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
   * LiveKit disconnect.
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
   * Cleanup.
   */
  useEffect(() => {
    return () => {
      room.disconnect();
    };
  }, [room]);

  /*
   * Loading.
   */
  if (loading || !token || !serverUrl) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl bg-[#080d1d]">
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
   * Error.
   */
  if (error) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-red-500/20 bg-[#120b12] p-6 text-center">
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
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-5 rounded-xl bg-purple-600 px-5 py-3 text-xs font-semibold text-white transition hover:bg-purple-500"
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
      className="relative flex min-h-[420px] flex-col overflow-hidden rounded-2xl"
    >

      <LiveTranscriptBridge
        transcriptEnabled={transcriptEnabled}
        onTranscriptChange={
          onTranscriptChange
        }
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
   TRANSCRIPT BRIDGE
========================================================= */

function LiveTranscriptBridge({
  transcriptEnabled,
  onTranscriptChange,
  onConversationReadyChange,
}: LiveVideoRoomProps) {
  const participants = useParticipants();

  const transcriptions =
    useTranscriptions();

  const realParticipants =
    participants.filter(
      (participant) =>
        !participant.isAgent,
    );

  const conversationReady =
    realParticipants.length >= 2;

  /*
   * Tell parent whether stranger is connected.
   */
  useEffect(() => {
    onConversationReadyChange(
      conversationReady,
    );
  }, [
    conversationReady,
    onConversationReadyChange,
  ]);

  /*
   * Transcript.
   */
  useEffect(() => {

    /*
     * OFF = no transcript.
     */
    if (!transcriptEnabled) {
      onTranscriptChange([]);
      return;
    }

    /*
     * Only real LiveKit transcription.
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
   PARTICIPANT VIDEO AREA
========================================================= */

function LiveParticipantGrid() {
  /*
   * IMPORTANT:
   *
   * withPlaceholder:false means the result is a real
   * TrackReference and can safely be passed to VideoTrack.
   */
  const tracks = useTracks([
    {
      source: Track.Source.Camera,
      withPlaceholder: false,
    },
  ]);

  /*
   * Find YOUR camera.
   */
  const localTrack = tracks.find(
    (track) =>
      track.participant.isLocal,
  );

  /*
   * Find STRANGER camera.
   */
  const remoteTrack = tracks.find(
    (track) =>
      !track.participant.isLocal,
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#050817]">


      {/* =================================================
          MOBILE VIEW
      ================================================= */}

      <div className="relative h-[430px] w-full overflow-hidden bg-[#090e20] md:hidden">

        {/* STRANGER LARGE */}

        {remoteTrack ? (
          <VideoTrack
            trackRef={remoteTrack}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#090e20] to-[#10182d]">

            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-3xl">
                👤
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Waiting for stranger...
              </p>

            </div>

          </div>
        )}


        {/* STRANGER LABEL */}

        <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/75 px-4 py-1.5 text-xs font-bold text-white backdrop-blur">

          <span className="mr-1 text-emerald-400">
            ●
          </span>

          STRANGER

        </div>


        {/* =================================================
            YOU SMALL VIDEO
        ================================================= */}

        <div className="absolute right-3 top-3 z-20 h-[125px] w-[105px] overflow-hidden rounded-xl border-2 border-white/20 bg-[#111827] shadow-xl">

          {localTrack ? (
            <VideoTrack
              trackRef={localTrack}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-900 text-2xl">
              🙂
            </div>
          )}

          <div className="absolute bottom-1 right-1 rounded-md bg-black/75 px-2 py-1 text-[9px] font-bold text-white">
            YOU
          </div>

        </div>

      </div>


      {/* =================================================
          LAPTOP / DESKTOP VIEW
      ================================================= */}

      <div className="hidden min-h-0 flex-1 gap-4 p-4 md:flex">

        {/* YOU */}

        <DesktopVideoBox
          track={localTrack}
          label="YOU"
          waitingText="Starting your camera..."
          local
        />

        {/* STRANGER */}

        <DesktopVideoBox
          track={remoteTrack}
          label="STRANGER"
          waitingText="Waiting for stranger..."
        />

      </div>


      {/* =================================================
          CAMERA + MIC
      ================================================= */}

      <div className="flex items-center justify-center gap-3 border-t border-slate-800 bg-[#070b18] p-3">

        {/* CAMERA */}

        <TrackToggle
          source={
            Track.Source.Camera as any
          }
          className="flex h-12 min-w-[90px] items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#0c1429] px-4 text-xs font-semibold text-white transition hover:border-purple-500 hover:bg-purple-500/10"
        >
          📹 Camera
        </TrackToggle>


        {/* MICROPHONE */}

        <TrackToggle
          source={
            Track.Source.Microphone as any
          }
          className="flex h-12 min-w-[90px] items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#0c1429] px-4 text-xs font-semibold text-white transition hover:border-purple-500 hover:bg-purple-500/10"
        >
          🎙️ Mic
        </TrackToggle>

      </div>

    </div>
  );
}


/* =========================================================
   DESKTOP VIDEO BOX
========================================================= */

function DesktopVideoBox({
  track,
  label,
  waitingText,
  local = false,
}: {
  track:
    | ReturnType<typeof useTracks>[number]
    | undefined;

  label: string;

  waitingText: string;

  local?: boolean;
}) {
  return (
    <div className="relative min-h-[330px] min-w-0 flex-1 overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-[#090e20] to-[#10182d]">

      {track ? (

        <VideoTrack
          trackRef={track}
          autoPlay
          playsInline
          className="h-full min-h-[330px] w-full object-cover"
        />

      ) : (

        <div className="flex h-full min-h-[330px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-3xl">
              {local ? "🙂" : "👤"}
            </div>

            <p className="mt-4 text-sm text-slate-500">
              {waitingText}
            </p>

          </div>

        </div>

      )}

      {/* LABEL */}

      <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/75 px-4 py-1.5 text-xs font-bold text-white backdrop-blur">

        <span className="mr-1 text-emerald-400">
          ●
        </span>

        {label}

      </div>

    </div>
  );
}