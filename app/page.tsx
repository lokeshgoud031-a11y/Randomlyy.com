"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(true);
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("Telugu");
  const [mode, setMode] = useState<"video" | "audio">("video");
  const [translation, setTranslation] = useState(true);

  return (
    <main
      className={
        darkMode
          ? "min-h-screen bg-[#050817] text-white"
          : "min-h-screen bg-slate-100 text-slate-900"
      }
    >
      {/* HEADER */}
      <header
        className={
          darkMode
            ? "border-b border-white/10 bg-[#050817]/95"
            : "border-b border-slate-200 bg-white"
        }
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🌍</div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Randomlyy
                <span className="text-purple-400">.com</span>
              </h1>

              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
                Global Voice
              </p>
            </div>
          </div>

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
                  ? "rounded-full bg-white px-3 py-2 text-sm shadow text-slate-900"
                  : "rounded-full px-3 py-2 text-sm text-slate-500"
              }
            >
              ☀️
            </button>

            <button
              onClick={() => setDarkMode(true)}
              className={
                darkMode
                  ? "rounded-full bg-slate-800 px-3 py-2 text-sm shadow text-white"
                  : "rounded-full px-3 py-2 text-sm text-slate-500"
              }
            >
              🌙
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-4xl px-5 pb-10 pt-16 text-center">
        <div className="mb-5 text-7xl drop-shadow-2xl">
          🌍
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
          Connect Globally
        </p>

        <h2 className="mt-3 text-5xl font-black tracking-tight sm:text-6xl">
          Speak Freely
        </h2>

        <p
          className={
            darkMode
              ? "mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400"
              : "mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-600"
          }
        >
          Meet people from around the world through random
          video or voice conversations with real-time
          language support.
        </p>
      </section>

      {/* SETUP */}
      <section className="mx-auto max-w-2xl px-5 pb-16">
        <div
          className={
            darkMode
              ? "rounded-[28px] border border-purple-500/20 bg-[#0b1125] p-6 shadow-2xl shadow-purple-950/30"
              : "rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl"
          }
        >
          {/* NAME */}
          <div>
            <label className="text-sm font-semibold">
              Your name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className={
                darkMode
                  ? "mt-2 w-full rounded-xl border border-slate-700 bg-[#080d1d] px-4 py-4 text-sm text-white outline-none transition focus:border-purple-500"
                  : "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-sm outline-none focus:border-purple-500"
              }
            />
          </div>

          {/* LANGUAGE */}
          <div className="mt-6">
            <label className="text-sm font-semibold">
              Preferred language
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                🌐
              </span>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={
                  darkMode
                    ? "mt-2 w-full appearance-none rounded-xl border border-slate-700 bg-[#080d1d] px-11 py-4 text-sm text-white outline-none focus:border-purple-500"
                    : "mt-2 w-full appearance-none rounded-xl border border-slate-300 bg-white px-11 py-4 text-sm outline-none focus:border-purple-500"
                }
              >
                <option>Telugu</option>
                <option>English</option>
                <option>Hindi</option>
                <option>Tamil</option>
                <option>Kannada</option>
                <option>Malayalam</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>

              <span className="absolute right-4 top-1/2 -translate-y-1/2">
               ⌄
              </span>
            </div>
          </div>

          {/* MODE */}
          <div className="mt-6">
            <label className="text-sm font-semibold">
              Conversation mode
            </label>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("video")}
                className={
                  mode === "video"
                    ? "rounded-xl border border-purple-400 bg-purple-500/15 px-4 py-4 text-sm font-semibold text-purple-300 shadow-lg shadow-purple-950/30"
                    : "rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-4 text-sm text-slate-400"
                }
              >
                📹 &nbsp; Video
              </button>

              <button
                onClick={() => setMode("audio")}
                className={
                  mode === "audio"
                    ? "rounded-xl border border-purple-400 bg-purple-500/15 px-4 py-4 text-sm font-semibold text-purple-300"
                    : "rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-4 text-sm text-slate-400"
                }
              >
                🎙️ &nbsp; Audio
              </button>
            </div>
          </div>

          {/* TRANSLATION */}
          <div
            className={
              darkMode
                ? "mt-6 flex items-center justify-between rounded-xl border border-slate-700 bg-[#080d1d] p-4"
                : "mt-6 flex items-center justify-between rounded-xl border border-slate-300 bg-slate-50 p-4"
            }
          >
            <div>
              <p className="text-sm font-semibold">
                Real-time translation
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Translate conversations automatically
              </p>
            </div>

            <button
              onClick={() =>
                setTranslation((value) => !value)
              }
              className={
                translation
                  ? "relative h-7 w-12 rounded-full bg-emerald-500"
                  : "relative h-7 w-12 rounded-full bg-slate-700"
              }
            >
              <span
                className={
                  translation
                    ? "absolute right-1 top-1 h-5 w-5 rounded-full bg-white shadow"
                    : "absolute left-1 top-1 h-5 w-5 rounded-full bg-slate-400 shadow"
                }
              />
            </button>
          </div>

          {/* START */}
          <Link
            href="/room"
            className="mt-6 block rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 px-5 py-4 text-center text-sm font-bold text-white shadow-xl shadow-purple-950/40 transition hover:scale-[1.01] hover:from-purple-500 hover:to-violet-400"
          >
            Start Random Chat&nbsp; →
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-5 pb-16 text-center sm:grid-cols-3">
        <div>
          <div className="text-3xl">👥</div>
          <p className="mt-3 text-sm font-semibold">
            Meet new people
          </p>
        </div>

        <div>
          <div className="text-3xl">🌐</div>
          <p className="mt-3 text-sm font-semibold">
            Different cultures
          </p>
        </div>

        <div>
          <div className="text-3xl">💬</div>
          <p className="mt-3 text-sm font-semibold">
            Real conversations
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pb-10 text-center">
        <p className="text-sm font-semibold">
          Randomlyy
          <span className="text-purple-400">.com</span>
        </p>

        <p className="mt-1 text-xs tracking-wider text-slate-500">
          Global network online
        </p>
      </footer>
    </main>
  );
}