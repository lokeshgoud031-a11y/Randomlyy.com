import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050817] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#070b18]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            Randomlyy<span className="text-purple-500">.com</span>
          </Link>

          <Link
            href="/room"
            className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-purple-500"
          >
            Start Chat
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto flex min-h-[75vh] max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
          🌍 Connect globally · Speak locally
        </div>

        <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          Randomlyy Chat with Strangers
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          Meet and chat with strangers from around the world through
          random video and voice chat.
        </p>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
          Connect with new people, have real conversations, and
          communicate across languages with real-time translation.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/room"
            className="rounded-2xl bg-purple-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-purple-900/20 transition hover:bg-purple-500"
          >
            🎥 Chat with Strangers
          </Link>

          <Link
            href="/room"
            className="rounded-2xl border border-slate-700 bg-slate-900 px-8 py-4 text-sm font-bold text-white transition hover:border-purple-500"
          >
            🎙️ Start Voice Chat
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid w-full max-w-4xl gap-5 md:grid-cols-3">
          <Feature
            icon="🌍"
            title="Meet Worldwide"
            description="Connect with people from different countries and cultures."
          />

          <Feature
            icon="🎥"
            title="Live Video Chat"
            description="Have real-time video conversations with your matched stranger."
          />

          <Feature
            icon="🌐"
            title="Real-Time Translation"
            description="Communicate naturally across different languages."
          />
        </div>
      </section>

      {/* SEO Content */}
      <section className="border-t border-white/10 bg-[#070b18]">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-2xl font-bold">
            Chat with Strangers Online
          </h2>

          <p className="mt-5 leading-8 text-slate-400">
            Randomlyy is a random chat platform designed to help
            people meet new strangers online. Start a random video
            chat or voice conversation and discover people from
            around the world.
          </p>

          <h2 className="mt-12 text-2xl font-bold">
            Random Video Chat with People Worldwide
          </h2>

          <p className="mt-5 leading-8 text-slate-400">
            Looking for a new conversation? Randomlyy makes it easy
            to connect with strangers through live video and voice
            chat. Choose your camera and microphone, start chatting,
            and meet someone new.
          </p>

          <h2 className="mt-12 text-2xl font-bold">
            Connect Globally · Speak Locally
          </h2>

          <p className="mt-5 leading-8 text-slate-400">
            Language should not stop people from connecting.
            Randomlyy is built with real-time translation to make
            conversations between people speaking different
            languages easier.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} Randomlyy.com · Connect globally ·
          Speak locally
        </p>
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1122] p-6 text-left">
      <div className="text-3xl">{icon}</div>

      <h3 className="mt-4 text-lg font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}