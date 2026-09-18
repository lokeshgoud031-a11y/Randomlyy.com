import {
  AccessToken,
  RoomAgentDispatch,
  RoomConfiguration,
} from "livekit-server-sdk";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const room =
      typeof body.room === "string"
        ? body.room.trim()
        : "";

    const identity =
      typeof body.identity === "string"
        ? body.identity.trim()
        : "";

    if (!room) {
      return Response.json(
        {
          error: "Room ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const finalIdentity =
      identity ||
      `guest-${crypto.randomUUID()}`;

    const apiKey =
      process.env.LIVEKIT_API_KEY;

    const apiSecret =
      process.env.LIVEKIT_API_SECRET;

    const serverUrl =
      process.env.LIVEKIT_URL ||
      process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (
      !apiKey ||
      !apiSecret ||
      !serverUrl
    ) {
      console.error(
        "Missing LiveKit environment variables.",
      );

      return Response.json(
        {
          error:
            "LiveKit server configuration is incomplete.",
        },
        {
          status: 500,
        },
      );
    }

    const token = new AccessToken(
      apiKey,
      apiSecret,
      {
        identity: finalIdentity,
        ttl: "2h",
      },
    );

    token.addGrant({
      roomJoin: true,
      room,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    token.roomConfig =
      new RoomConfiguration({
        agents: [
          new RoomAgentDispatch({
            agentName:
              "randomlyy-transcriber",
          }),
        ],
      });

    const jwt =
      await token.toJwt();

    return Response.json({
      token: jwt,
      room,
      serverUrl,
      identity: finalIdentity,
    });
  } catch (error) {
    console.error(
      "LiveKit token error:",
      error,
    );

    return Response.json(
      {
        error:
          "Unable to create LiveKit token.",
      },
      {
        status: 500,
      },
    );
  }
}