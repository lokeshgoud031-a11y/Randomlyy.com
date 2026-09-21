"use client";

import "@livekit/components-styles";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  TrackToggle,
  VideoTrack,
  useParticipants,
  useRoomContext,
  useTracks,
  type TrackReference,
} from "@livekit/components-react";

import {
  RoomEvent,
  Track,
  type RemoteParticipant,
} from "livekit-client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/* =========================================================
   TYPES
========================================================= */

export type ChatMessage = {
  id: string;
  text: string;
  isLocal: boolean;
  senderId: string;
};

export type TranscriptEntry = {
  id: string;
  speaker: string;
  text: string;
};

type OutgoingMessage = {
  id: string;
  text: string;
};

type LiveVideoRoomProps = {
  roomId: string;

  transcriptEnabled: boolean;

  onTranscriptChange: (
    entries: TranscriptEntry[],
  ) => void;

  onConversationReadyChange: (
    ready: boolean,
  ) => void;

  onChatMessage: (
    message: ChatMessage,
  ) => void;

  outgoingMessage:
    | OutgoingMessage
    | null;

  onNext: () => void;
};

/* =========================================================
   MAIN LIVE VIDEO ROOM
========================================================= */

export default function LiveVideoRoom({
  roomId,
  transcriptEnabled,
  onTranscriptChange,
  onConversationReadyChange,
  onChatMessage,
  outgoingMessage,
  onNext,
}: LiveVideoRoomProps) {
  const [previewStream, setPreviewStream] =
    useState<MediaStream | null>(null);

  const previewStreamRef =
    useRef<MediaStream | null>(null);

  const previewVideoRef =
    useRef<HTMLVideoElement | null>(null);

  const [cameraError, setCameraError] =
    useState("");

  const [token, setToken] =
    useState<string | null>(null);

  const [serverUrl, setServerUrl] =
    useState<string | null>(null);

  const [tokenError, setTokenError] =
    useState("");

  /* =======================================================
     STOP PREVIEW
  ======================================================= */

  const stopPreview = useCallback(() => {
    const stream =
      previewStreamRef.current;

    if (stream) {
      stream
        .getTracks()
        .forEach((track) => {
          track.stop();
        });
    }

    previewStreamRef.current = null;
    setPreviewStream(null);
  }, []);

  /* =======================================================
     LOCAL CAMERA PREVIEW WHILE WAITING
  ======================================================= */

  useEffect(() => {
    if (roomId) {
      return;
    }

    let cancelled = false;

    async function startPreview() {
      try {
        setCameraError("");

        if (
          typeof navigator === "undefined" ||
          !navigator.mediaDevices ||
          !navigator.mediaDevices.getUserMedia
        ) {
          setCameraError(
            "Camera access is not supported in this browser.",
          );

          return;
        }

        if (previewStreamRef.current) {
          previewStreamRef.current
            .getTracks()
            .forEach((track) => {
              track.stop();
            });

          previewStreamRef.current = null;
        }

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
            audio: true,
          });

        if (cancelled) {
          stream
            .getTracks()
            .forEach((track) => {
              track.stop();
            });

          return;
        }

        previewStreamRef.current = stream;
        setPreviewStream(stream);
      } catch (error) {
        console.error(
          "Camera preview error:",
          error,
        );

        if (!cancelled) {
          setCameraError(
            "Camera permission was blocked or the camera is being used by another application.",
          );
        }
      }
    }

    startPreview();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  /* =======================================================
     ATTACH PREVIEW STREAM
  ======================================================= */

  useEffect(() => {
    const video =
      previewVideoRef.current;

    if (!video) {
      return;
    }

    if (!previewStream) {
      video.srcObject = null;
      return;
    }

    video.srcObject = previewStream;

    video.play().catch(() => {});
  }, [previewStream]);

  /* =======================================================
     STOP PREVIEW AFTER MATCH
  ======================================================= */

  useEffect(() => {
    if (!roomId) {
      return;
    }

    stopPreview();
  }, [roomId, stopPreview]);

  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      const stream =
        previewStreamRef.current;

      if (stream) {
        stream
          .getTracks()
          .forEach((track) => {
            track.stop();
          });
      }

      previewStreamRef.current = null;
    };
  }, []);

  /* =======================================================
     GET LIVEKIT TOKEN
  ======================================================= */

  useEffect(() => {
    if (!roomId) {
      setToken(null);
      setServerUrl(null);
      setTokenError("");
      return;
    }

    let cancelled = false;

    async function loadToken() {
      try {
        setToken(null);
        setServerUrl(null);
        setTokenError("");

        let identity =
          sessionStorage.getItem(
            "randomlyy-user-id",
          );

        if (!identity) {
          identity =
            `guest-${crypto.randomUUID()}`;

          sessionStorage.setItem(
            "randomlyy-user-id",
            identity,
          );
        }

        const response =
          await fetch(
            "/api/livekit/token",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                room: roomId,
                identity,
              }),
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to create LiveKit token.",
          );
        }

        if (cancelled) {
          return;
        }

        setToken(data.token);
        setServerUrl(data.serverUrl);
      } catch (error) {
        console.error(
          "LiveKit token error:",
          error,
        );

        if (!cancelled) {
          setTokenError(
            error instanceof Error
              ? error.message
              : "Unable to connect to LiveKit.",
          );
        }
      }
    }

    loadToken();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  /* =======================================================
     WAITING SCREEN
  ======================================================= */

  if (!roomId) {
    return (
      <div className="relative h-[calc(100vh-170px)] min-h-[520px] w-full overflow-hidden rounded-2xl bg-[#080d1d]">

        {previewStream ? (
          <video
            ref={previewVideoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#090e20] to-[#10182d]">
            <div className="px-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-4xl">
                📹
              </div>

              <p className="mt-5 text-sm font-semibold text-white">
                Starting your camera...
              </p>

              {cameraError && (
                <p className="mx-auto mt-3 max-w-sm text-xs leading-5 text-red-300">
                  {cameraError}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="absolute left-3 top-3 z-20 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
          <span className="mr-2 text-emerald-400">
            ●
          </span>
          YOUR CAMERA
        </div>

        <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-2xl border border-white/10 bg-black/75 px-6 py-4 text-center backdrop-blur">
          <div className="text-2xl">
            🌍
          </div>

          <p className="mt-2 text-sm font-bold text-white">
            Finding a stranger...
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            Your camera is ready
          </p>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="absolute bottom-5 right-4 z-40 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-xl transition hover:bg-purple-500 active:scale-95"
        >
          Next →
        </button>
      </div>
    );
  }

  /* =======================================================
     TOKEN ERROR
  ======================================================= */

  if (tokenError) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-2xl bg-[#080d1d] p-6">
        <div className="text-center">

          <div className="text-5xl">
            ⚠️
          </div>

          <h3 className="mt-4 text-lg font-bold text-white">
            Video connection failed
          </h3>

          <p className="mx-auto mt-3 max-w-md text-xs leading-5 text-red-300">
            {tokenError}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-5 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-500"
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }

  /* =======================================================
     WAITING FOR TOKEN
  ======================================================= */

  if (!token || !serverUrl) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-2xl bg-[#080d1d]">
        <div className="text-center">

          <div className="mb-4 animate-pulse text-5xl">
            🌍
          </div>

          <h3 className="text-sm font-bold text-white">
            Connecting to your stranger...
          </h3>

          <p className="mt-2 text-xs text-slate-500">
            Starting your live video call
          </p>

        </div>
      </div>
    );
  }

  /* =======================================================
     LIVEKIT ROOM
  ======================================================= */

  return (
    <LiveKitRoom
      key={roomId}
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={true}
      video={true}
      options={{
        adaptiveStream: true,
        dynacast: true,
      }}
      onConnected={() => {
        console.log(
          "Randomlyy LiveKit connected:",
          roomId,
        );
      }}
      onDisconnected={() => {
        console.log(
          "Randomlyy LiveKit disconnected:",
          roomId,
        );
      }}
      onError={(error) => {
        console.error(
          "LiveKit error:",
          error,
        );
      }}
      className="relative w-full overflow-hidden rounded-2xl"
    >

      <ChatController
        outgoingMessage={outgoingMessage}
        onChatMessage={onChatMessage}
      />

      <ConversationController
        onConversationReadyChange={
          onConversationReadyChange
        }
        transcriptEnabled={
          transcriptEnabled
        }
        onTranscriptChange={
          onTranscriptChange
        }
      />

      <VideoLayout
        onNext={onNext}
      />

      <RoomAudioRenderer />

    </LiveKitRoom>
  );
}

/* =========================================================
   CHAT CONTROLLER
========================================================= */

function ChatController({
  outgoingMessage,
  onChatMessage,
}: {
  outgoingMessage:
    | OutgoingMessage
    | null;

  onChatMessage: (
    message: ChatMessage,
  ) => void;
}) {
  const room =
    useRoomContext();

  /* =======================================================
     RECEIVE CHAT
  ======================================================= */

  useEffect(() => {
    const receiveMessage = (
      payload: Uint8Array,
      participant:
        | RemoteParticipant
        | undefined,
      _kind: unknown,
      topic?: string,
    ) => {
      if (
        topic !==
        "randomlyy-chat"
      ) {
        return;
      }

      try {
        const decoded =
          new TextDecoder().decode(
            payload,
          );

        const data =
          JSON.parse(decoded) as {
            id?: string;
            text?: string;
          };

        if (
          !data.text ||
          !data.text.trim()
        ) {
          return;
        }

        onChatMessage({
          id:
            data.id ||
            crypto.randomUUID(),

          text: data.text,

          isLocal: false,

          senderId:
            participant?.identity ||
            "stranger",
        });
      } catch (error) {
        console.error(
          "Chat receive error:",
          error,
        );
      }
    };

    room.on(
      RoomEvent.DataReceived,
      receiveMessage,
    );

    return () => {
      room.off(
        RoomEvent.DataReceived,
        receiveMessage,
      );
    };
  }, [
    room,
    onChatMessage,
  ]);

  /* =======================================================
     SEND CHAT
  ======================================================= */

  useEffect(() => {
    if (!outgoingMessage) {
      return;
    }

    const message =
      outgoingMessage;

    let cancelled = false;

    async function sendMessage() {
      try {
        if (
          room.state !==
          "connected"
        ) {
          return;
        }

        const encoded =
          new TextEncoder().encode(
            JSON.stringify({
              id: message.id,
              text: message.text,
            }),
          );

        await room.localParticipant.publishData(
          encoded,
          {
            reliable: true,
            topic:
              "randomlyy-chat",
          },
        );

        if (cancelled) {
          return;
        }

        onChatMessage({
          id: message.id,

          text: message.text,

          isLocal: true,

          senderId:
            room.localParticipant
              .identity,
        });
      } catch (error) {
        console.error(
          "Chat send error:",
          error,
        );
      }
    }

    sendMessage();

    return () => {
      cancelled = true;
    };
  }, [
    room,
    outgoingMessage,
    onChatMessage,
  ]);

  return null;
}

/* =========================================================
   CONVERSATION CONTROLLER
========================================================= */

function ConversationController({
  onConversationReadyChange,
  transcriptEnabled,
  onTranscriptChange,
}: {
  onConversationReadyChange: (
    ready: boolean,
  ) => void;

  transcriptEnabled: boolean;

  onTranscriptChange: (
    entries: TranscriptEntry[],
  ) => void;
}) {
  const participants =
    useParticipants();

  const humanParticipants =
    participants.filter(
      (participant) =>
        !(participant as any)
          .isAgent,
    );

  const ready =
    humanParticipants.length >=
    2;

  useEffect(() => {
    onConversationReadyChange(
      ready,
    );
  }, [
    ready,
    onConversationReadyChange,
  ]);

  useEffect(() => {
    if (!transcriptEnabled) {
      onTranscriptChange([]);
    }
  }, [
    transcriptEnabled,
    onTranscriptChange,
  ]);

  return null;
}

/* =========================================================
   VIDEO LAYOUT

   STRANGER = BIG
   YOU      = SMALL
========================================================= */

function VideoLayout({
  onNext,
}: {
  onNext: () => void;
}) {
  const tracks =
    useTracks(
      [
        {
          source:
            Track.Source.Camera,
          withPlaceholder: false,
        },
      ],
      {
        onlySubscribed: true,
      },
    );

  const localTrack =
    tracks.find(
      (track) =>
        track.participant
          .isLocal,
    ) as
      | TrackReference
      | undefined;

  const remoteTrack =
    tracks.find(
      (track) =>
        !track.participant
          .isLocal &&
        !(track.participant as any)
          .isAgent,
    ) as
      | TrackReference
      | undefined;

  return (
    <div className="relative w-full bg-[#050817]">

      {/* =================================================
          MOBILE
      ================================================= */}

      <div className="relative block h-[calc(100vh-165px)] min-h-[520px] w-full overflow-hidden md:hidden">

        {/* BIG STRANGER */}

        <div className="absolute inset-0 bg-[#090e20]">

          {remoteTrack ? (
            <VideoTrack
              trackRef={remoteTrack}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#090e20] to-[#10182d]">

              <div className="text-center">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-4xl">
                  🌍
                </div>

                <p className="mt-5 text-sm font-semibold text-white">
                  Finding a stranger...
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Waiting for video connection
                </p>

              </div>

            </div>
          )}

        </div>

        {/* STRANGER LABEL */}

        <div className="absolute left-3 top-3 z-30 rounded-full border border-white/10 bg-black/75 px-4 py-2 text-xs font-bold text-white backdrop-blur">

          <span className="mr-1 text-emerald-400">
            ●
          </span>

          STRANGER

        </div>

        {/* YOUR SMALL CAMERA */}

        <div className="absolute right-3 top-3 z-40 h-[150px] w-[110px] overflow-hidden rounded-2xl border-2 border-white/30 bg-black shadow-2xl">

          {localTrack ? (
            <VideoTrack
              trackRef={localTrack}
              className="h-full w-full object-cover"
              style={{
                transform: "scaleX(-1)",
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-900 text-3xl">
              📹
            </div>
          )}

          <div className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-1 text-[9px] font-bold text-white">
            YOU
          </div>

        </div>

        {/* CAMERA + MIC */}

        <div className="absolute bottom-[72px] left-1/2 z-40 flex -translate-x-1/2 gap-3">

          <TrackToggle
            source={
              Track.Source.Camera
            }
          />

          <TrackToggle
            source={
              Track.Source.Microphone
            }
          />

        </div>

        {/* NEXT */}

        <button
          type="button"
          onClick={onNext}
          className="absolute bottom-3 right-3 z-50 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-xl transition hover:bg-purple-500 active:scale-95"
        >
          Next →
        </button>

      </div>

      {/* =================================================
          DESKTOP
      ================================================= */}

      <div className="hidden md:block">

        <div className="relative h-[calc(100vh-165px)] min-h-[520px] w-full">

          {/* BIG STRANGER VIDEO */}

          <div className="absolute inset-0 overflow-hidden rounded-2xl bg-[#090e20]">

            {remoteTrack ? (
              <VideoTrack
                trackRef={remoteTrack}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#090e20] to-[#10182d]">

                <div className="text-center">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-4xl">
                    🌍
                  </div>

                  <p className="mt-5 text-sm font-semibold text-white">
                    Finding a stranger...
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Waiting for video connection
                  </p>

                </div>

              </div>
            )}

            {/* STRANGER LABEL */}

            <div className="absolute left-4 top-4 z-30 rounded-full bg-black/75 px-4 py-2 text-xs font-bold text-white backdrop-blur">

              <span className="mr-1 text-emerald-400">
                ●
              </span>

              STRANGER

            </div>

            {/* NEXT */}

            <button
              type="button"
              onClick={onNext}
              className="absolute bottom-5 right-5 z-50 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-xl transition hover:bg-purple-500 active:scale-95"
            >
              Next →
            </button>

          </div>

          {/* YOUR SMALL CAMERA */}

          <div className="absolute right-5 top-5 z-40 h-[190px] w-[280px] overflow-hidden rounded-2xl border-2 border-white/30 bg-black shadow-2xl">

            {localTrack ? (
              <VideoTrack
                trackRef={localTrack}
                className="h-full w-full object-cover"
                style={{ transform: "none" }}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-900 text-4xl">
                📹
              </div>
            )}

            <div className="absolute bottom-3 left-3 rounded-md bg-black/75 px-3 py-1 text-[10px] font-bold text-white">
              YOU
            </div>

          </div>

        </div>

        {/* CONTROLS */}

        <div className="flex items-center justify-center gap-3 border-t border-slate-800 bg-[#070b18] p-4">

          <TrackToggle
            source={
              Track.Source.Camera
            }
          />

          <TrackToggle
            source={
              Track.Source.Microphone
            }
          />

        </div>

      </div>

    </div>
  );
}