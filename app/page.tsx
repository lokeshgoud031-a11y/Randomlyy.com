"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(true);

  const [name, setName] = useState("");
  const [language, setLanguage] = useState("Telugu");
  const [mode, setMode] = useState<"video" | "audio">(
    "video",
  );
  const [translation, setTranslation] =
    useState(true);

  return (
    <main
      className={
        darkMode
          ? "min-h-screen bg-slate-950 text-white"
          : "min-h-screen bg-slate-100 text-slate-900"
      }
    >
      {/* HEADER */}
      <header
        className={
          darkMode
            ? "border-b border-slate-800"
            : "border-b border-slate-200 bg-white"
        }
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <h1 className="text-xl font-bold">
              Randomlyy
              <span className="text-purple-500">
                .com
              </span>
            </h1>

            <p className="text-xs text-slate-500">
              Global network online
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setDarkMode(false)}
              className={
                !darkMode
                  ? "rounded-lg bg-slate-900 px-3 py-2 text-xs text-white"
                  : "rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400"
              }
            >
              ☀ Light
            </button>

            <button
              onClick={() => setDarkMode(true)}
              className={
                darkMode
                  ? "rounded-lg bg-white px-3 py-2 text-xs text-black"
                  : "rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-600"
              }
            >
              🌙 Dark
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-4xl px-5 pb-8 pt-16 text-center">
        <p className="text-sm font-medium text-purple-400">
          Connect globally · Speak locally
        </p>

        <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Meet someone.
          <br />
          Speak freely.
        </h2>

        <p
          className={
            darkMode
              ? "mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400"
              : "mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600"
          }
        >
          Meet people from around the world through
          random video or voice conversations with
          real-time language support.
        </p>
      </section>

      {/* SETUP CARD */}
      <section className="mx-auto max-w-2xl px-5 pb-16">
        <div
          className={
            darkMode
              ? "rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
              : "rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
          }
        >
          {/* NAME */}
          <div>
            <label className="text-sm font-medium">
              Your name
            </label>

            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter your name"
              className={
                darkMode
                  ? "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  : "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
              }
            />
          </div>

          {/* LANGUAGE */}
          <div className="mt-5">
            <label className="text-sm font-medium">
              Preferred language
            </label>

            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value)
              }
              className={
                darkMode
                  ? "mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white"
                  : "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
              }
            >
              <option>Telugu</option>
              <option>English</option>
              <option>Hindi</option>
              <option>Tamil</option>
              <option>Kannada</option>
            </select>
          </div>

          {/* MODE */}
          <div className="mt-5">
            <label className="text-sm font-medium">
              Conversation mode
            </label>

            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("video")}
                className={
                  mode === "video"
                    ? "rounded-xl border border-purple-500 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-400"
                    : "rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-500"
                }
              >
                📹 Video
              </button>

              <button
                onClick={() => setMode("audio")}
                className={
                  mode === "audio"
                    ? "rounded-xl border border-purple-500 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-400"
                    : "rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-500"
                }
              >
                🎙️ Audio
              </button>
            </div>
          </div>

          {/* TRANSLATION */}
          <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-700 p-4">
            <div>
              <p className="text-sm font-medium">
                Real-time translation
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Translate conversations automatically
              </p>
            </div>

            <button
              onClick={() =>
                setTranslation(
                  (current) => !current,
                )
              }
              className={
                translation
                  ? "rounded-full bg-green-500 px-4 py-2 text-xs font-semibold text-white"
                  : "rounded-full bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-400"
              }
            >
              {translation ? "ON" : "OFF"}
            </button>
          </div>

          {/* START */}
          <Link
            href="/room"
            className="mt-6 block w-full rounded-xl bg-purple-600 px-5 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            Start Random Chat →
          </Link>
        </div>
      </section>
    </main>
  );
}