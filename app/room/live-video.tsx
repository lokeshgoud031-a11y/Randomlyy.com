"use client";

import "@livekit/components-styles";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  TrackToggle,
  TrackReference,
  VideoTrack,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";

export default function LiveVideoRoom() {
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const connect = async () => {
      try {
        const response = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: "randomlyy-lobby" }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not join the live room.");
        setToken(data.token);
        setServerUrl(process.env.NEXT_PUBLIC_LIVEKIT_URL || "");
      } catch (connectionError) {
        setError(connectionError instanceof Error ? connectionError.message : "Could not join the live room.");
      }
    };

    connect();
  }, []);

  if (error) {
    return <div className="flex h-full items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-center text-sm text-amber-200">{error}</div>;
  }

  if (!token || !serverUrl) {
    return <div className="flex h-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/60 text-sm text-slate-400">Connecting to live video...</div>;
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect
      audio
      video
      onError={(roomError) => setError(`Live video connection failed: ${roomError.message}`)}
      className="relative flex h-full flex-col overflow-hidden rounded-2xl"
    >
      <LiveParticipantGrid />
      <div className="flex shrink-0 justify-center gap-2 border-t border-slate-800 bg-slate-950/95 p-2">
        <TrackToggle
          source={Track.Source.Microphone}
          className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-white"
        >
          Mic
        </TrackToggle>
        <TrackToggle
          source={Track.Source.Camera}
          className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-white"
        >
          Cam
        </TrackToggle>
      </div>
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function LiveParticipantGrid() {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
  ]);

  return (
    <div data-lk-theme="default" className="grid min-h-0 flex-1 grid-cols-1 gap-3 bg-slate-950 p-3 sm:grid-cols-2">
      {[0, 1].map((slot) => {
        const track = tracks[slot];
        const label = track?.participant.isLocal ? "You" : track ? "Stranger" : slot === 0 ? "You" : "Stranger";

        return (
          <div key={track ? `${track.participant.identity}-${track.source}` : `waiting-${slot}`} className="relative min-h-0 overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-950 to-slate-900">
            {track ? (
              <VideoTrack
                trackRef={track as TrackReference}
                autoPlay
                playsInline
                className="block h-full min-h-40 w-full object-cover"
                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
                onSubscriptionStatusChanged={(subscribed) => {
                  if (!subscribed) console.warn("LiveKit camera track is not subscribed.");
                }}
              />
            ) : (
              <div className="flex h-full min-h-40 items-center justify-center text-sm text-slate-500">
                Waiting for stranger...
              </div>
            )}
            <span className="absolute bottom-2 left-2 rounded-full border border-slate-600 bg-slate-950/85 px-3 py-1 text-xs text-white">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
