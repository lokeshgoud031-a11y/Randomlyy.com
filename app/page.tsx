"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("Aarav");
  const [language, setLanguage] = useState("Telugu");
  const [mode, setMode] = useState("video");
  const [translation, setTranslation] = useState(true);

  const languages = ["Telugu", "English", "Hindi", "Tamil", "Kannada", "Malayalam"];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b14] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.15),_transparent_30%)]" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img src="/icon.png" alt="Global logo" className="h-11 w-11 object-contain" />
          <div>
            <p className="text-xl font-bold tracking-tight text-white">Randomlyy.com</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Global voice</p>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Global network online
          </span>
          <button className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500">
            Dark
          </button>
          <button className="rounded-full border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500">
            Light
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-16 pt-8 lg:px-8 lg:pb-24 lg:pt-12">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
            Connect globally · Speak locally
          </div>

          <h1 className="max-w-xl text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl">
            Meet someone.
            <span className="block bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent">
              Speak freely.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base text-slate-300 md:text-lg">
            Instant video and voice conversations with people around the world, powered by live translation and effortless cultural connection.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
            <div className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2">
              12k+ live conversations
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2">
              27 languages supported
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2">
              <span className="text-indigo-300">AI</span> translation enabled
            </div>
          </div>

          <div className="mt-8 max-w-xl rounded-[28px] border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-indigo-950/30 backdrop-blur-sm md:p-6">
            <label className="mb-2 block text-sm font-medium text-slate-200">Your name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How should we call you?"
              className="mb-5 w-full rounded-2xl border border-slate-700 bg-[#071321] px-4 py-3 text-base text-white outline-none transition focus:border-indigo-500"
            />

            <label className="mb-2 block text-sm font-medium text-slate-200">Your language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mb-5 w-full rounded-2xl border border-slate-700 bg-[#071321] px-4 py-3 text-base text-white outline-none transition focus:border-indigo-500"
            >
              {languages.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <p className="mb-2 text-sm font-medium text-slate-200">Choose your mode</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode("video")}
                className={`rounded-2xl border p-4 text-left transition ${
                  mode === "video"
                    ? "border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/10"
                    : "border-slate-700 bg-slate-950/80 hover:border-slate-500"
                }`}
              >
                <div className="text-2xl">🎥</div>
                <div className="mt-3 font-semibold">Video</div>
                <div className="text-xs text-slate-400">Face-to-face</div>
              </button>

              <button
                type="button"
                onClick={() => setMode("audio")}
                className={`rounded-2xl border p-4 text-left transition ${
                  mode === "audio"
                    ? "border-cyan-400 bg-cyan-500/15 shadow-lg shadow-cyan-500/10"
                    : "border-slate-700 bg-slate-950/80 hover:border-slate-500"
                }`}
              >
                <div className="text-2xl">🎙</div>
                <div className="mt-3 font-semibold">Audio</div>
                <div className="text-xs text-slate-400">Voice only</div>
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-700 bg-[#0a1727] p-4">
              <div>
                <p className="font-semibold text-white">Real-time translation</p>
                <p className="text-xs text-slate-400">Translate during conversation</p>
              </div>

              <button
                type="button"
                onClick={() => setTranslation(!translation)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  translation ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-200"
                }`}
              >
                {translation ? "ON" : "OFF"}
              </button>
            </div>

            <Link
              href="/room"
              className="mt-5 block w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 py-4 text-center text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
            >
              Start your journey →
            </Link>
          </div>
        </div>

      </section>
    </main>
  );
}