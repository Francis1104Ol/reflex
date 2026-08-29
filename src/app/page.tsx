import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">

        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-3xl font-bold">
          R
        </div>

        <h1 className="text-5xl font-bold tracking-tight">
          Delivery management, without the chaos.
        </h1>

        <p className="mt-6 text-lg text-slate-400">
          Reflex helps retailers create deliveries, dispatchers assign riders,
          and riders confirm deliveries in real time.
        </p>

        <div className="mt-8">
          <Link
            href="/login"
            className="inline-flex rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-400"
          >
            Sign in to Reflex
          </Link>
        </div>

      </div>
    </main>
  );
}