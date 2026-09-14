"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import LiveVideoRoom, {
  TranscriptEntry,
} from "./live-video";

export default function RoomPage() {
  const [darkMode, setDarkMode] = useState(true);

  /*
   * Transcript OFF initially.
   */
  const [transcriptEnabled, setTranscriptEnabled] =
    useState(false);

  const [transcriptLanguage, setTranscriptLanguage] =
    useState("English");

  const [transcriptEntries, setTranscriptEntries] =
    useState<TranscriptEntry[]>([]);

  const [conversationReady, setConversationReady] =
    useState(false);

  /*
   * Stable callback.
   */
  const handleTranscriptChange = useCallback(
    (entries: TranscriptEntry[]) => {
      setTranscriptEntries(entries);
    },
    [],
  );

  /*
   * Stable callback.
   */
  const handleConversationReady = useCallback(
    (ready: boolean) => {
      setConversationReady(ready);
    },
    [],
  );

  /*
   * Temporary Next action.
   * Real random matching will be connected later.
   */
  const handleNext = () => {
    window.location.reload();
  };

  return (
    <main
      className={
        darkMode
          ? "min-h-screen bg-[#050817] text-white"
          : "min-h-screen bg-slate-100 text-slate-900"
      }
    >
      {/* =================================================
          HEADER
      ================================================= */}
      <header
        className={
          darkMode
            ? "border-b border-white/10 bg-[#050817]"
            : "border-b border-slate-200 bg-white"
        }
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <span className="text-4xl">🌍</span>

            <div>
              <div className="text-xl font-bold">
                Randomlyy
                <span className="text-purple-400">
                  .com
                </span>
              </div>

              <div className="text-[9px] uppercase tracking-[0.3em] text-slate-500">
                Global Voice
              </div>
            </div>
          </Link>

          {/* THEME */}
          <div
            className={
              darkMode
                ? "flex rounded-full border border-slate-700 bg-slate-900 p-1"
                : "flex rounded-full border border-slate-300 bg-slate-100 p-1"
            }
          >
            <button
              onClick={() => setDarkMode(false)}
              className={
                !darkMode
                  ? "rounded-full bg-white px-3 py-2 text-sm text-black shadow"
                  : "rounded-full px-3 py-2 text-sm text-slate-500"
              }
            >
              ☀️
            </button>

            <button
              onClick={() => setDarkMode(true)}
              className={
                darkMode
                  ? "rounded-full bg-slate-800 px-3 py-2 text-sm text-white shadow"
                  : "rounded-full px-3 py-2 text-sm text-slate-500"
              }
            >
              🌙
            </button>
          </div>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* BACK + TITLE */}
        <div className="mb-5 flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-400 transition hover:border-purple-500 hover:text-white"
          >
            ← Back
          </Link>

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
              Video call
            </p>

            <h1 className="text-xl font-bold">
              Live conversation
            </h1>
          </div>

          <div className="ml-auto hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 sm:block">
            ● Real-time ON
          </div>
        </div>

        {/* =================================================
            VIDEO CARD
        ================================================= */}
        <section
          className={
            darkMode
              ? "rounded-[28px] border border-purple-500/15 bg-[#0b1125] p-3 shadow-2xl shadow-purple-950/20"
              : "rounded-[28px] border border-slate-200 bg-white p-3 shadow-xl"
          }
        >
          {/* LIVEKIT */}
          <div className="min-h-[500px]">
            <LiveVideoRoom
              transcriptEnabled={transcriptEnabled}
              onTranscriptChange={
                handleTranscriptChange
              }
              onConversationReadyChange={
                handleConversationReady
              }
            />
          </div>

          {/* NEXT */}
          <div className="mt-3 flex justify-center">
            <button
              onClick={handleNext}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-purple-950/30 transition hover:from-purple-500 hover:to-violet-400 sm:max-w-xs"
            >
              Next&nbsp; →
            </button>
          </div>
        </section>

        {/* =================================================
            TRANSCRIPT / CHAT
        ================================================= */}
        <section
          className={
            darkMode
              ? "mt-5 rounded-[28px] border border-purple-500/15 bg-[#0b1125] p-5"
              : "mt-5 rounded-[28px] border border-slate-200 bg-white p-5"
          }
        >
          {/* CHAT HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                Live chat
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Transcript
              </h2>
            </div>

            {/* TRANSCRIPT SWITCH */}
            <button
              onClick={() =>
                setTranscriptEnabled(
                  (value) => !value,
                )
              }
              className={
                transcriptEnabled
                  ? "relative h-8 w-14 rounded-full bg-emerald-500"
                  : "relative h-8 w-14 rounded-full bg-slate-700"
              }
            >
              <span
                className={
                  transcriptEnabled
                    ? "absolute right-1 top-1 h-6 w-6 rounded-full bg-white shadow"
                    : "absolute left-1 top-1 h-6 w-6 rounded-full bg-slate-400 shadow"
                }
              />

              <span className="sr-only">
                Toggle transcript
              </span>
            </button>
          </div>

          {/* LANGUAGE */}
          <div className="mt-5">
            <label className="text-xs font-medium text-slate-500">
              Transcript language
            </label>

            <select
              value={transcriptLanguage}
              onChange={(e) =>
                setTranscriptLanguage(
                  e.target.value,
                )
              }
              className={
                darkMode
                  ? "mt-2 w-full rounded-xl border border-slate-700 bg-[#080d1d] px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  : "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
              }
            >
              <option>English</option>
              <option>Telugu</option>
              <option>Hindi</option>
              <option>Tamil</option>
              <option>Kannada</option>
              <option>Malayalam</option>
            </select>
          </div>

          {/* CHAT */}
          <div
            className={
              darkMode
                ? "mt-5 min-h-[190px] rounded-2xl bg-[#070b18] p-4"
                : "mt-5 min-h-[190px] rounded-2xl bg-slate-50 p-4"
            }
          >
            {!transcriptEnabled ? (
              <div className="flex min-h-[150px] items-center justify-center text-center">
                <div>
                  <div className="text-3xl">
                    💬
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-400">
                    Transcript is OFF
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Turn it ON to see the real
                    conversation.
                  </p>
                </div>
              </div>
            ) : transcriptEntries.length === 0 ? (
              <div className="flex min-h-[150px] items-center justify-center text-center">
                <div>
                  <div className="text-3xl">
                    🎙️
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-400">
                    Waiting for conversation...
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Speak to generate a real transcript.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {transcriptEntries.map(
                  (entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4"
                    >
                      <p className="text-xs font-bold text-purple-400">
                        {entry.speaker}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        {entry.text}
                      </p>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* VOICE CHAT INPUT */}
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-700 bg-[#080d1d] p-2">
            <button
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-lg"
              title="Voice input"
            >
              🎙️
            </button>

            <div className="flex-1 px-2">
              <p className="text-sm text-slate-500">
                Give voice instead of typing...
              </p>
            </div>

            <button
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-lg text-white"
              title="Send"
            >
              ➤
            </button>
          </div>

          {/* CONNECTION STATUS */}
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <span
              className={
                conversationReady
                  ? "h-2 w-2 rounded-full bg-emerald-500"
                  : "h-2 w-2 rounded-full bg-yellow-500"
              }
            />

            {conversationReady
              ? "Stranger connected"
              : "Waiting for stranger"}
          </div>
        </section>
      </div>
    </main>
  );
}