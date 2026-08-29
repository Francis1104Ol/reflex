"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type Role = "retailer" | "dispatcher" | "rider";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("retailer");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    try {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanName || !cleanEmail || !password) {
        setError("Please complete all fields.");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }

      /*
       * Create the Supabase Auth account.
       *
       * The database trigger we created will automatically
       * create the corresponding public.profiles record.
       */
      const { data, error: signupError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: cleanName,
              role,
            },
          },
        });

      console.log("SIGNUP RESULT:", {
        user: data.user,
        session: data.session,
        error: signupError,
      });

      if (signupError) {
        setError(signupError.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Account could not be created.");
        setLoading(false);
        return;
      }

      /*
       * Supabase may require email confirmation.
       * In that case there will be no session yet.
       */
      if (!data.session) {
        setMessage(
          "Account created successfully. Please check your email to confirm your account. Redirecting to login..."
        );

        await new Promise((resolve) =>
          setTimeout(resolve, 1800)
        );

        router.replace("/login");
        return;
      }

      /*
       * If email confirmation is disabled,
       * the user already has a session.
       */
      setMessage(
        "Account created successfully. Redirecting to login..."
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 1200)
      );

      await supabase.auth.signOut();

      router.replace("/login");
    } catch (err) {
      console.error("SIGNUP FAILED:", err);

      setError(
        "Something went wrong while creating your account."
      );

      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">

      <div className="mx-auto max-w-md">

        {/* LOGO */}

        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-2xl font-bold">
            R
          </div>

          <h1 className="text-3xl font-bold">
            Create your Reflex account
          </h1>

          <p className="mt-2 text-slate-400">
            Create an account to start managing deliveries.
          </p>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSignup}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >

          <div className="space-y-4">

            {/* NAME */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Full name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="David Mwangi"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            {/* EMAIL */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="david@example.com"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Minimum 6 characters"
                minLength={6}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            {/* ROLE */}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Account type
              </label>

              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as Role)
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              >
                <option value="retailer">
                  Retailer
                </option>

                <option value="dispatcher">
                  Dispatcher
                </option>

                <option value="rider">
                  Rider
                </option>
              </select>
            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {message && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
              {message}
            </div>
          )}

          {/* CREATE ACCOUNT */}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

          {/* LOGIN */}

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-4 w-full text-sm text-slate-400 transition hover:text-emerald-400"
          >
            Already have an account? Sign in
          </button>

        </form>

      </div>

    </main>
  );
}