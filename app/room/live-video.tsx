"use client";

import "@livekit/components-styles";
import {
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  TrackReferenceOrPlaceholder,
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
    <LiveKitRoom token={token} serverUrl={serverUrl} connect audio video className="h-full overflow-hidden rounded-2xl">
      <LiveParticipantGrid />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function LiveParticipantGrid() {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  return (
    <div className="grid h-full auto-rows-fr grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2 bg-slate-950 p-2">
      {tracks.map((track) => (
        <ParticipantTile key={`${track.participant.identity}-${track.source}`} trackRef={track as TrackReferenceOrPlaceholder} />
      ))}
    </div>
  );
}
