import {
  AccessToken,
  RoomAgentDispatch,
  RoomConfiguration,
} from "livekit-server-sdk";

export async function POST(request: Request) {
  try {
    const { room = "randomlyy-lobby", identity } = await request.json();

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const serverUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !serverUrl) {
      return Response.json(
        {
          error: "LiveKit server configuration is incomplete.",
        },
        { status: 500 },
      );
    }

    const participantIdentity =
      identity || `guest-${crypto.randomUUID()}`;

    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      ttl: "2h",
    });

    token.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
    });

    // Keep the transcription agent available.
    // Transcript will NOT be shown in the UI until the user enables it.
    token.roomConfig = new RoomConfiguration({
      agents: [
        new RoomAgentDispatch({
          agentName: "randomlyy-transcriber",
        }),
      ],
    });

    return Response.json({
      token: await token.toJwt(),
      room,
      serverUrl,
    });
  } catch (error) {
    console.error("LiveKit token error:", error);

    return Response.json(
      {
        error: "Could not create LiveKit token.",
      },
      { status: 500 },
    );
  }
}