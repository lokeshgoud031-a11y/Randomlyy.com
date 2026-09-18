"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import LiveVideoRoom, {
  type ChatMessage,
  type TranscriptEntry,
} from "./live-video";

type MatchResponse = {
  success?: boolean;
  matched?: boolean;
  status?: string;
  roomId?: string;
  partnerId?: string;
  error?: string;
};

export default function RoomPage() {
  const [userId, setUserId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [partnerId, setPartnerId] = useState("");

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [messageText, setMessageText] =
    useState("");

  const [outgoingMessage, setOutgoingMessage] =
    useState<{
      id: string;
      text: string;
    } | null>(null);

  const [transcriptEnabled, setTranscriptEnabled] =
    useState(false);

  const [transcriptEntries, setTranscriptEntries] =
    useState<TranscriptEntry[]>([]);

  const [conversationReady, setConversationReady] =
    useState(false);

  const [language, setLanguage] =
    useState("English");

  const [error, setError] =
    useState("");

  const [isNextLoading, setIsNextLoading] =
    useState(false);

  const mountedRef =
    useRef(true);

  const joiningRef =
    useRef(false);

  /*
   * ========================================================
   * CREATE USER ID
   * ========================================================
   */

  useEffect(() => {
    mountedRef.current = true;

    let id =
      sessionStorage.getItem(
        "randomlyy-user-id",
      );

    if (!id) {
      id =
        `guest-${crypto.randomUUID()}`;

      sessionStorage.setItem(
        "randomlyy-user-id",
        id,
      );
    }

    setUserId(id);

    return () => {
      mountedRef.current = false;
    };
  }, []);


  /*
   * ========================================================
   * MATCH API
   * ========================================================
   */

  const callMatchApi =
    useCallback(
      async (
        action:
          | "join"
          | "status"
          | "next"
          | "leave",
        currentUserId: string,
      ): Promise<MatchResponse | null> => {
        try {
          const response =
            await fetch(
              "/api/match",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  action,
                  userId:
                    currentUserId,
                }),
              },
            );

          const text =
            await response.text();

          let data: MatchResponse;

          try {
            data =
              JSON.parse(
                text,
              ) as MatchResponse;
          } catch {
            console.error(
              "Non JSON response:",
              text,
            );

            throw new Error(
              `Match API returned invalid response. HTTP ${response.status}`,
            );
          }

          if (!response.ok) {
            throw new Error(
              data.error ||
                `Match API failed. HTTP ${response.status}`,
            );
          }

          return data;

        } catch (err) {
          console.error(
            "Match API error:",
            err,
          );

          if (
            mountedRef.current
          ) {
            setError(
              err instanceof Error
                ? err.message
                : "Matchmaking failed.",
            );
          }

          return null;
        }
      },
      [],
    );


  /*
   * ========================================================
   * JOIN RANDOM CHAT
   * ========================================================
   */

  useEffect(() => {
    if (!userId) {
      return;
    }

    if (joiningRef.current) {
      return;
    }

    joiningRef.current = true;

    let cancelled = false;

    async function join() {
      const result =
        await callMatchApi(
          "join",
          userId,
        );

      if (
        cancelled ||
        !result
      ) {
        return;
      }

      if (
        result.matched &&
        result.roomId
      ) {
        setRoomId(
          result.roomId,
        );

        setPartnerId(
          result.partnerId ||
            "",
        );

        setError("");

      } else {
        setRoomId("");
        setPartnerId("");
      }
    }

    join();

    return () => {
      cancelled = true;
    };
  }, [
    userId,
    callMatchApi,
  ]);


  /*
   * ========================================================
   * CHECK MATCH STATUS
   * ========================================================
   */

  useEffect(() => {
    if (!userId) {
      return;
    }

    const interval =
      window.setInterval(
        async () => {
          const result =
            await callMatchApi(
              "status",
              userId,
            );

          if (
            !result ||
            !mountedRef.current
          ) {
            return;
          }

          /*
           * New match
           */

          if (
            result.matched &&
            result.roomId
          ) {
            if (
              result.roomId !==
              roomId
            ) {
              setMessages([]);

              setOutgoingMessage(
                null,
              );

              setTranscriptEntries(
                [],
              );

              setConversationReady(
                false,
              );

              setRoomId(
                result.roomId,
              );

              setPartnerId(
                result.partnerId ||
                  "",
              );

              setError("");
            }

            return;
          }

          /*
           * Partner pressed NEXT.
           */

          if (
            roomId &&
            result.status ===
              "ended"
          ) {
            setRoomId("");

            setPartnerId("");

            setMessages([]);

            setOutgoingMessage(
              null,
            );

            setTranscriptEntries(
              [],
            );

            setConversationReady(
              false,
            );
          }
        },
        1500,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [
    userId,
    roomId,
    callMatchApi,
  ]);


  /*
   * ========================================================
   * CHAT RECEIVE
   * ========================================================
   */

  const handleChatMessage =
    useCallback(
      (message: ChatMessage) => {
        setMessages(
          (current) => {
            if (
              current.some(
                (item) =>
                  item.id ===
                  message.id,
              )
            ) {
              return current;
            }

            return [
              ...current,
              message,
            ];
          },
        );
      },
      [],
    );


  /*
   * ========================================================
   * SEND CHAT
   * ========================================================
   */

  const sendMessage =
    useCallback(() => {
      const text =
        messageText.trim();

      if (
        !text ||
        !roomId
      ) {
        return;
      }

      setOutgoingMessage({
        id:
          crypto.randomUUID(),

        text,
      });

      setMessageText("");

    }, [
      messageText,
      roomId,
    ]);


  /*
   * ========================================================
   * CHAT ENTER
   * ========================================================
   */

  function handleChatKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (
      event.key ===
      "Enter"
    ) {
      event.preventDefault();

      sendMessage();
    }
  }


  /*
   * ========================================================
   * NEXT
   * ========================================================
   */

  const handleNext =
    useCallback(async () => {
      if (
        !userId ||
        isNextLoading
      ) {
        return;
      }

      setIsNextLoading(true);

      /*
       * Clear current conversation.
       */

      setRoomId("");

      setPartnerId("");

      setMessages([]);

      setOutgoingMessage(
        null,
      );

      setTranscriptEntries(
        [],
      );

      setConversationReady(
        false,
      );


      /*
       * Ask server for another stranger.
       */

      const result =
        await callMatchApi(
          "next",
          userId,
        );


      if (
        result?.matched &&
        result.roomId
      ) {
        setRoomId(
          result.roomId,
        );

        setPartnerId(
          result.partnerId ||
            "",
        );
      }


      setIsNextLoading(false);

    }, [
      userId,
      isNextLoading,
      callMatchApi,
    ]);


  /*
   * ========================================================
   * PAGE CLOSE
   * ========================================================
   */

  useEffect(() => {
    if (!userId) {
      return;
    }

    function leaveRoom() {
      const data =
        JSON.stringify({
          action:
            "leave",

          userId,
        });

      const blob =
        new Blob(
          [data],
          {
            type:
              "application/json",
          },
        );

      navigator.sendBeacon(
        "/api/match",
        blob,
      );
    }

    window.addEventListener(
      "beforeunload",
      leaveRoom,
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        leaveRoom,
      );
    };
  }, [userId]);


  /*
   * ========================================================
   * TRANSCRIPT
   * ========================================================
   */

  const handleTranscriptChange =
    useCallback(
      (
        entries: TranscriptEntry[],
      ) => {
        setTranscriptEntries(
          entries,
        );
      },
      [],
    );


  const handleConversationReady =
    useCallback(
      (ready: boolean) => {
        setConversationReady(
          ready,
        );
      },
      [],
    );


  /*
   * ========================================================
   * RENDER
   * ========================================================
   */

  return (
    <main className="min-h-screen bg-[#050817] text-white">

      {/* HEADER */}

      <header className="border-b border-white/10 bg-[#050817]">

        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4 sm:px-6">

          <Link
            href="/"
            className="text-xl font-extrabold sm:text-2xl"
          >
            Randomlyy
            <span className="text-purple-500">
              .com
            </span>
          </Link>

          <div className="flex items-center gap-3">

            <div className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300 sm:block">
              <span className="mr-2">
                ●
              </span>
              Real-time ON
            </div>

            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300"
            >
              ← Back
            </Link>

          </div>

        </div>

      </header>


      {/* MAIN */}

      <section className="mx-auto w-full max-w-[1550px] px-3 py-5 sm:px-6">

        <div className="mb-5">

          <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-400">
            RANDOM CHAT
          </p>

          <h1 className="mt-1 text-3xl font-extrabold">
            Live conversation
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Connect globally · Speak locally
          </p>

        </div>


        {/* ERROR */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}


        {/* VIDEO */}

        <div className="overflow-hidden rounded-3xl border border-purple-500/20 bg-[#080d1d] p-1 sm:p-4">

          <LiveVideoRoom
            roomId={
              roomId
            }

            transcriptEnabled={
              transcriptEnabled
            }

            onTranscriptChange={
              handleTranscriptChange
            }

            onConversationReadyChange={
              handleConversationReady
            }

            onChatMessage={
              handleChatMessage
            }

            outgoingMessage={
              outgoingMessage
            }

            onNext={
              handleNext
            }
          />

        </div>


        {/* LOWER AREA */}

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_330px]">


          {/* CHAT */}

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#070b18]">

            <div className="border-b border-white/10 px-4 py-4">

              <p className="text-sm font-bold">
                Live chat
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Chat directly with your stranger.
              </p>

            </div>


            <div className="h-[280px] overflow-y-auto p-4">

              {messages.length ===
              0 ? (
                <div className="flex h-full items-center justify-center text-center">

                  <div>

                    <div className="text-4xl">
                      💬
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-300">
                      No messages yet
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Say hello when you connect.
                    </p>

                  </div>

                </div>
              ) : (

                <div className="space-y-3">

                  {messages.map(
                    (
                      message,
                    ) => (

                      <div
                        key={
                          message.id
                        }
                        className={`flex ${
                          message.isLocal
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                            message.isLocal
                              ? "rounded-br-md bg-purple-600 text-white"
                              : "rounded-bl-md bg-slate-800 text-slate-200"
                          }`}
                        >
                          {
                            message.text
                          }
                        </div>

                      </div>

                    ),
                  )}

                </div>

              )}

            </div>


            {/* INPUT */}

            <div className="border-t border-white/10 p-3">

              <div className="flex gap-2">

                <input
                  value={
                    messageText
                  }

                  onChange={(
                    event,
                  ) =>
                    setMessageText(
                      event.target
                        .value,
                    )
                  }

                  onKeyDown={
                    handleChatKeyDown
                  }

                  disabled={
                    !roomId
                  }

                  placeholder={
                    roomId
                      ? "Type a message..."
                      : "Waiting for a stranger..."
                  }

                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0b1122] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600"
                />

                <button
                  type="button"
                  onClick={
                    sendMessage
                  }

                  disabled={
                    !roomId ||
                    !messageText.trim()
                  }

                  className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold disabled:opacity-40"
                >
                  Send
                </button>

              </div>

            </div>

          </div>


          {/* SETTINGS */}

          <div className="rounded-2xl border border-white/10 bg-[#070b18] p-5">

            <h2 className="text-sm font-bold">
              Conversation settings
            </h2>


            <div className="mt-5">

              <label className="text-xs font-semibold text-slate-400">
                Your language
              </label>

              <select
                value={
                  language
                }

                onChange={(
                  event,
                ) =>
                  setLanguage(
                    event.target
                      .value,
                  )
                }

                className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1122] px-3 py-3 text-sm text-white"
              >

                <option>
                  English
                </option>

                <option>
                  Telugu
                </option>

                <option>
                  Hindi
                </option>

                <option>
                  Tamil
                </option>

                <option>
                  Kannada
                </option>

                <option>
                  Malayalam
                </option>

              </select>

            </div>


            {/* TRANSCRIPT */}

            <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-[#0b1122] p-4">

              <div>

                <p className="text-sm font-semibold">
                  Real-time transcript
                </p>

                <p className="mt-1 text-[11px] text-slate-500">
                  Show conversation transcript.
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setTranscriptEnabled(
                    (
                      current,
                    ) =>
                      !current,
                  )
                }

                className={`relative h-7 w-12 rounded-full ${
                  transcriptEnabled
                    ? "bg-purple-600"
                    : "bg-slate-700"
                }`}
              >

                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white ${
                    transcriptEnabled
                      ? "left-6"
                      : "left-1"
                  }`}
                />

              </button>

            </div>


            {/* INFO */}

            <div className="mt-5 rounded-xl border border-purple-500/10 bg-purple-500/5 p-4">

              <p className="text-xs font-semibold text-purple-300">
                🌍 Random matching
              </p>

              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                Press Next to end the current conversation and find another stranger.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* FOOTER */}

      <footer className="border-t border-white/10 px-6 py-8 text-center">

        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} Randomlyy.com · Connect globally · Speak locally
        </p>

      </footer>

    </main>
  );
}