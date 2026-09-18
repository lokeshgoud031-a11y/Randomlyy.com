import { cli, defineAgent, inference, ServerOptions, voice } from "@livekit/agents";
import { fileURLToPath } from "node:url";

const agentName = "randomlyy-transcriber";

export default defineAgent({
  entry: async (ctx) => {
    const session = new voice.AgentSession({
      // LiveKit Inference transcribes speech in real time. No separate STT key is needed.
      stt: new inference.STT({ model: "deepgram/nova-3-general" }),
    });

    await ctx.connect();

    await session.start({
      agent: voice.Agent.create({
        instructions: "You only transcribe the speech of room participants. Never generate a reply.",
      }),
      room: ctx.room,
      // Sends each participant's speech to the frontend as an lk.transcription text stream.
      outputOptions: { syncTranscription: false },
    });
  },
});

cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName,
  }),
);
