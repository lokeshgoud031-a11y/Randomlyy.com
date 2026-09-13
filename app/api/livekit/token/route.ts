import { AccessToken } from "livekit-server-sdk";

export async function POST(request: Request) {
  const { room = "randomlyy-lobby", identity } = await request.json();
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return Response.json({ error: "LiveKit server credentials are not configured." }, { status: 500 });
  }

  const participantIdentity = identity || `guest-${crypto.randomUUID()}`;
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

  return Response.json({
    token: await token.toJwt(),
    room,
  });
}
