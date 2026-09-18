"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import LiveVideoRoom, {
  TranscriptEntry,
} from "./live-video";

export default function RoomPage() {
  /* =====================================================
     THEME
  ===================================================== */

  const [darkMode, setDarkMode] = useState(true);

  /* =====================================================
     TRANSCRIPT
  ===================================================== */

  const [transcriptEnabled, setTranscriptEnabled] =
    useState(false);

  const [transcriptLanguage, setTranscriptLanguage] =
    useState("English");

  const [transcriptEntries, setTranscriptEntries] =
    useState<TranscriptEntry[]>([]);

  /* =====================================================
     CONNECTION STATUS
  ===================================================== */

  const [conversationReady, setConversationReady] =
    useState(false);

  /* =====================================================
     TYPING CHAT
  ===================================================== */

  const [message, setMessage] = useState("");

  const [chatMessages, setChatMessages] = useState<
    {
      id: string;
      sender: string;
      text: string;
    }[]
  >([]);

  /* =====================================================
     CALLBACKS
  ===================================================== */

  const handleTranscriptChange = useCallback(
    (entries: TranscriptEntry[]) => {
      setTranscriptEntries(entries);
    },
    [],
  );

  const handleConversationReady = useCallback(
    (ready: boolean) => {
      setConversationReady(ready);
    },
    [],
  );

  /* =====================================================
     NEXT STRANGER
  ===================================================== */

  const handleNext = () => {
    window.location.reload();
  };

  /* =====================================================
     SEND CHAT MESSAGE
  ===================================================== */

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    /*
     * Currently adds the user's own message locally.
     *
     * Real stranger-to-stranger chat will be connected
     * through LiveKit data messages next.
     */
    setChatMessages((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        sender: "YOU",
        text: trimmedMessage,
      },
    ]);

    setMessage("");
  };

  /* =====================================================
     VOICE BUTTON
  ===================================================== */

  const handleVoiceInput = () => {
    /*
     * Voice-to-text will be connected separately.
     *
     * We don't put fake text into the chat.
     */
    if (
      typeof window !== "undefined" &&
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert(
        "Voice input is not supported by this browser.",
      );
      return;
    }

    alert(
      "Voice input will be connected to the chat next.",
    );
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
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-8">

          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <span className="text-4xl">
              🌍
            </span>

            <div>
              <div className="text-xl font-bold sm:text-2xl">
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

          {/* THEME BUTTONS */}

          <div
            className={
              darkMode
                ? "flex rounded-full border border-slate-700 bg-slate-900 p-1"
                : "flex rounded-full border border-slate-300 bg-slate-100 p-1"
            }
          >

            {/* LIGHT */}

            <button
              type="button"
              onClick={() =>
                setDarkMode(false)
              }
              className={
                !darkMode
                  ? "rounded-full bg-white px-3 py-2 text-sm text-black shadow"
                  : "rounded-full px-3 py-2 text-sm text-slate-500"
              }
              aria-label="Light mode"
            >
              ☀️
            </button>

            {/* DARK */}

            <button
              type="button"
              onClick={() =>
                setDarkMode(true)
              }
              className={
                darkMode
                  ? "rounded-full bg-slate-800 px-3 py-2 text-sm text-white shadow"
                  : "rounded-full px-3 py-2 text-sm text-slate-500"
              }
              aria-label="Dark mode"
            >
              🌙
            </button>

          </div>

        </div>
      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-8 sm:py-6">

        {/* =================================================
            BACK + TITLE
        ================================================= */}

        <div className="mb-4 flex items-center gap-3">

          <Link
            href="/"
            className={
              darkMode
                ? "rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-400 transition hover:border-purple-500 hover:text-white"
                : "rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-600 transition hover:border-purple-500"
            }
          >
            ← Back
          </Link>

          <div>

            <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500">
              Video call
            </p>

            <h1 className="text-lg font-bold sm:text-2xl">
              Live conversation
            </h1>

          </div>

          {/* CONNECTION STATUS */}

          <div className="ml-auto hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 sm:block">

            <span className="mr-1">
              ●
            </span>

            Real-time ON

          </div>

        </div>


        {/* =================================================
            VIDEO SECTION
        ================================================= */}

        <section
          className={
            darkMode
              ? "relative rounded-[26px] border border-purple-500/20 bg-[#0b1125] p-2 shadow-2xl shadow-purple-950/20 sm:p-4"
              : "relative rounded-[26px] border border-slate-200 bg-white p-2 shadow-xl sm:p-4"
          }
        >

          {/* LIVE VIDEO */}

          <LiveVideoRoom
            transcriptEnabled={
              transcriptEnabled
            }
            onTranscriptChange={
              handleTranscriptChange
            }
            onConversationReadyChange={
              handleConversationReady
            }
          />


          {/* =================================================
              NEXT BUTTON
          ================================================= */}

          <div className="mt-3 flex justify-center md:absolute md:right-[-145px] md:top-1/2 md:mt-0 md:-translate-y-1/2">

            <button
              type="button"
              onClick={handleNext}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-purple-950/30 transition hover:from-purple-500 hover:to-violet-400 md:w-[125px]"
            >
              Next →
            </button>

          </div>

        </section>


        {/* =================================================
            SPACE BETWEEN VIDEO AND CHAT
        ================================================= */}

        <div className="h-8 sm:h-12" />


        {/* =================================================
            CHAT SECTION
        ================================================= */}

        <section
          className={
            darkMode
              ? "rounded-[26px] border border-purple-500/20 bg-[#0b1125] p-4 shadow-xl sm:p-6"
              : "rounded-[26px] border border-slate-200 bg-white p-4 shadow-xl sm:p-6"
          }
        >

          {/* CHAT HEADER */}

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                Live chat
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Chat
              </h2>

            </div>


            {/* TRANSCRIPT TOGGLE */}

            <div className="flex items-center gap-3">

              <span className="hidden text-xs text-slate-500 sm:block">
                Transcript
              </span>

              <button
                type="button"
                onClick={() =>
                  setTranscriptEnabled(
                    (value) => !value,
                  )
                }
                className={
                  transcriptEnabled
                    ? "relative h-8 w-14 rounded-full bg-emerald-500 transition"
                    : "relative h-8 w-14 rounded-full bg-slate-700 transition"
                }
                aria-label="Toggle transcript"
              >

                <span
                  className={
                    transcriptEnabled
                      ? "absolute right-1 top-1 h-6 w-6 rounded-full bg-white shadow"
                      : "absolute left-1 top-1 h-6 w-6 rounded-full bg-slate-400 shadow"
                  }
                />

              </button>

              <span
                className={
                  transcriptEnabled
                    ? "text-xs font-semibold text-emerald-400"
                    : "text-xs font-semibold text-slate-500"
                }
              >
                {transcriptEnabled
                  ? "ON"
                  : "OFF"}
              </span>

            </div>

          </div>


          {/* =================================================
              TRANSCRIPT SETTINGS
          ================================================= */}

          <div className="mt-5">

            <label className="text-xs font-medium text-slate-500">
              Transcript language
            </label>

            <select
              value={transcriptLanguage}
              onChange={(event) =>
                setTranscriptLanguage(
                  event.target.value,
                )
              }
              className={
                darkMode
                  ? "mt-2 w-full rounded-xl border border-slate-700 bg-[#080d1d] px-4 py-3 text-sm text-white outline-none focus:border-purple-500 sm:max-w-md"
                  : "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500 sm:max-w-md"
              }
            >
              <option value="English">
                English
              </option>

              <option value="Telugu">
                Telugu
              </option>

              <option value="Hindi">
                Hindi
              </option>

              <option value="Tamil">
                Tamil
              </option>

              <option value="Kannada">
                Kannada
              </option>

              <option value="Malayalam">
                Malayalam
              </option>

            </select>

          </div>


          {/* =================================================
              TRANSCRIPT / CHAT MESSAGES
          ================================================= */}

          <div
            className={
              darkMode
                ? "mt-5 min-h-[180px] rounded-2xl border border-slate-800 bg-[#070b18] p-4"
                : "mt-5 min-h-[180px] rounded-2xl border border-slate-200 bg-slate-50 p-4"
            }
          >

            {/* TRANSCRIPT OFF */}

            {!transcriptEnabled ? (

              <div className="flex min-h-[145px] items-center justify-center text-center">

                <div>

                  <div className="text-3xl">
                    💬
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-400">
                    Transcript is OFF
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Turn it ON to see the real conversation.
                  </p>

                </div>

              </div>

            ) : transcriptEntries.length > 0 ? (

              /* REAL TRANSCRIPT */

              <div className="space-y-3">

                {transcriptEntries.map(
                  (entry) => (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4"
                    >

                      <p className="text-xs font-bold uppercase text-purple-400">
                        {entry.speaker}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        {entry.text}
                      </p>

                    </div>
                  ),
                )}

              </div>

            ) : chatMessages.length > 0 ? (

              /* USER CHAT */

              <div className="space-y-3">

                {chatMessages.map(
                  (chat) => (
                    <div
                      key={chat.id}
                      className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4"
                    >

                      <p className="text-xs font-bold text-purple-400">
                        {chat.sender}
                      </p>

                      <p className="mt-2 text-sm">
                        {chat.text}
                      </p>

                    </div>
                  ),
                )}

              </div>

            ) : (

              /* EMPTY */

              <div className="flex min-h-[145px] items-center justify-center text-center">

                <div>

                  <div className="text-3xl">
                    💬
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-400">
                    No messages yet
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Start a conversation below.
                  </p>

                </div>

              </div>

            )}

          </div>


          {/* =================================================
              CHAT INPUT
          ================================================= */}

          <div
            className={
              darkMode
                ? "mt-5 rounded-2xl border border-slate-700 bg-[#080d1d] p-2"
                : "mt-5 rounded-2xl border border-slate-300 bg-slate-50 p-2"
            }
          >

            <div className="flex items-center gap-2">

              {/* VOICE */}

              <button
                type="button"
                onClick={handleVoiceInput}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xl text-white transition hover:bg-slate-700"
                title="Voice input"
              >
                🎙️
              </button>


              {/* TYPING */}

              <input
                type="text"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter"
                  ) {
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className={
                  darkMode
                    ? "h-12 flex-1 rounded-xl border border-slate-700 bg-[#0c1429] px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-purple-500"
                    : "h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-purple-500"
                }
              />


              {/* SEND */}

              <button
                type="button"
                onClick={handleSendMessage}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-lg text-white transition hover:bg-purple-500"
                title="Send message"
              >
                ➤
              </button>

            </div>


            {/* INPUT HELP */}

            <div className="mt-2 flex justify-center gap-2 text-[10px] text-slate-500">

              <span>
                🎙️ Speak
              </span>

              <span>
                •
              </span>

              <span>
                ⌨️ Type
              </span>

              <span>
                •
              </span>

              <span>
                Enter to send
              </span>

            </div>

          </div>


          {/* =================================================
              CONNECTION STATUS
          ================================================= */}

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


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="py-8 text-center">

          <p className="text-sm font-semibold">
            Randomlyy
            <span className="text-purple-400">
              .com
            </span>
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Connect globally · Speak locally
          </p>

        </footer>

      </div>

    </main>
  );
}